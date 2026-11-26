import type {AppUpdateService, AppUpdateState} from "../services/app-update.service.ts";

// What the adapter needs from vite-plugin-pwa (virtual:pwa-register): it registers the service worker,
// tells when a newer version is waiting, and returns the function that switches to it
export type RegisterServiceWorker = (options: {
    immediate?: boolean,
    onNeedRefresh?: () => void,
    onRegisteredSW?: (url: string, registration: ServiceWorkerRegistration | undefined) => void,
}) => (reloadPage?: boolean) => Promise<void>;

// The part of a ServiceWorkerRegistration used here
export type UpdatableRegistration = Pick<ServiceWorkerRegistration, "update" | "installing" | "waiting">;

// The version.json written by the build next to the application
export const fetchDeployedVersion = async (): Promise<string | undefined> => {
    const response = await fetch("/version.json", {cache: "no-store"});
    if (!response.ok) return undefined;
    const {version} = await response.json() as { version?: unknown };
    return typeof version === "string" ? version : undefined;
};

// Finds out whether a newer version of the application was deployed, through the service worker of the PWA.
// The browser itself only looks for one when the page loads: an installed application that comes back
// from the background is not reloaded, so it is asked here.
export class PwaAppUpdateAdapter implements AppUpdateService {
    private state: AppUpdateState = {status: "idle"};
    private readonly listeners = new Set<() => void>();
    private registration: UpdatableRegistration | undefined;
    private readonly switchToWaitingVersion: (reloadPage?: boolean) => Promise<void>;
    private readonly deployedVersion: () => Promise<string | undefined>;

    constructor(registerServiceWorker: RegisterServiceWorker, deployedVersion = fetchDeployedVersion) {
        this.deployedVersion = deployedVersion;
        this.switchToWaitingVersion = registerServiceWorker({
            immediate: true,
            // a newer version is installed and waits: at start, or after a check
            onNeedRefresh: () => this.becomeReady(),
            onRegisteredSW: (_url, registration) => {
                this.registration = registration;
            },
        });
    }

    getState = (): AppUpdateState => this.state;

    subscribe = (listener: () => void): (() => void) => {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    };

    check = async (): Promise<void> => {
        // a newer version already waits: nothing more to ask
        if (this.state.status === "ready") return;
        const registration = this.registration;
        // no service worker: the application runs in development, or the browser has none
        if (!registration) {
            this.setState({status: "failed"});
            return;
        }
        this.setState({status: "checking"});
        try {
            // downloads the service worker again; the browser installs it when it changed
            await registration.update();
        } catch {
            this.setState({status: "failed"});
            return;
        }
        if (registration.waiting) {
            this.becomeReady();
            return;
        }
        const installing = registration.installing;
        if (!installing) {
            this.setState({status: "upToDate"});
            return;
        }
        this.setState({status: "downloading"});
        void this.learnNewVersion();
        installing.addEventListener("statechange", () => {
            if (installing.state === "installed") this.becomeReady();
            if (installing.state === "redundant") this.setState({status: "failed"});
        });
    };

    install = (): void => {
        // the waiting service worker takes control, then the page reloads
        void this.switchToWaitingVersion(true);
    };

    private becomeReady() {
        if (this.state.status === "ready") return;
        this.setState({status: "ready", newVersion: this.state.newVersion});
        if (!this.state.newVersion) void this.learnNewVersion();
    }

    private async learnNewVersion() {
        try {
            const newVersion = await this.deployedVersion();
            if (newVersion && newVersion !== this.state.newVersion) this.setState({...this.state, newVersion});
        } catch {
            // the number of the version is only shown when it is known
        }
    }

    private setState(state: AppUpdateState) {
        this.state = state;
        this.listeners.forEach(listener => listener());
    }
}
