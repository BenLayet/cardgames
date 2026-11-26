import {describe, expect, it, vi} from "vitest";

import {PwaAppUpdateAdapter, type RegisterServiceWorker, type UpdatableRegistration} from "./app-update.adapter.ts";

// A service worker being installed, whose state the test moves forward
const fakeInstallingWorker = () => {
    const listeners: (() => void)[] = [];
    const worker = {
        state: "installing" as ServiceWorkerState,
        addEventListener: (_type: string, listener: () => void) => listeners.push(listener),
        moveTo: (state: ServiceWorkerState) => {
            worker.state = state;
            listeners.forEach(listener => listener());
        },
    };
    return worker;
};

// Registers at once, with the given registration, and keeps what vite-plugin-pwa was given
const setUp = (registration?: Partial<UpdatableRegistration>, deployedVersion = (): Promise<string | undefined> => Promise.resolve("2.0.0")) => {
    const switchToWaitingVersion = vi.fn(() => Promise.resolve());
    let onNeedRefresh: (() => void) | undefined;
    const register: RegisterServiceWorker = options => {
        onNeedRefresh = options.onNeedRefresh;
        options.onRegisteredSW?.("/sw.js", registration && {
            installing: null, waiting: null, update: () => Promise.resolve(), ...registration,
        } as ServiceWorkerRegistration);
        return switchToWaitingVersion;
    };
    const adapter = new PwaAppUpdateAdapter(register, deployedVersion);
    return {adapter, switchToWaitingVersion, needRefresh: () => onNeedRefresh?.()};
};

describe("update of the application", () => {
    it("says the version is the latest when the server has nothing newer", async () => {
        const {adapter} = setUp({});
        await adapter.check();
        expect(adapter.getState()).toEqual({status: "upToDate"});
    });

    it("says the check failed when the server cannot be reached", async () => {
        const {adapter} = setUp({update: () => Promise.reject(new Error("offline"))});
        await adapter.check();
        expect(adapter.getState().status).toBe("failed");
    });

    it("says the check failed without a service worker, as in development", async () => {
        const {adapter} = setUp();
        await adapter.check();
        expect(adapter.getState().status).toBe("failed");
    });

    it("follows the download of a newer version until it is ready, with its number", async () => {
        const worker = fakeInstallingWorker();
        const {adapter} = setUp({installing: worker as unknown as ServiceWorker});
        await adapter.check();
        await vi.waitFor(() => expect(adapter.getState()).toEqual({status: "downloading", newVersion: "2.0.0"}));
        worker.moveTo("installed");
        expect(adapter.getState()).toEqual({status: "ready", newVersion: "2.0.0"});
    });

    it("is ready at once when a newer version already waits", async () => {
        const {adapter} = setUp({waiting: {} as ServiceWorker});
        await adapter.check();
        expect(adapter.getState().status).toBe("ready");
        await vi.waitFor(() => expect(adapter.getState().newVersion).toBe("2.0.0"));
    });

    it("is ready when vite-plugin-pwa finds a waiting version, even without a check", () => {
        const {adapter, needRefresh} = setUp({});
        needRefresh();
        expect(adapter.getState().status).toBe("ready");
    });

    it("still offers the update when the number of the new version is unknown", async () => {
        const {adapter} = setUp({waiting: {} as ServiceWorker}, () => Promise.reject(new Error("offline")));
        await adapter.check();
        expect(adapter.getState()).toEqual({status: "ready"});
    });

    it("tells the listeners about each change, until they leave", async () => {
        const {adapter} = setUp({});
        const listener = vi.fn();
        const leave = adapter.subscribe(listener);
        await adapter.check();
        expect(listener).toHaveBeenCalledTimes(2); // checking, then up to date
        leave();
        await adapter.check();
        expect(listener).toHaveBeenCalledTimes(2);
    });

    it("switches to the waiting version and reloads when the player installs it", () => {
        const {adapter, switchToWaitingVersion} = setUp({waiting: {} as ServiceWorker});
        adapter.install();
        expect(switchToWaitingVersion).toHaveBeenCalledWith(true);
    });
});

describe("check when the application comes back to the foreground", () => {
    // a document whose visibility the test changes
    const fakeDocument = () => {
        const listeners: (() => void)[] = [];
        const document = {
            visibilityState: "hidden" as DocumentVisibilityState,
            addEventListener: (_type: string, listener: () => void) => listeners.push(listener),
            show: () => {
                document.visibilityState = "visible";
                listeners.forEach(listener => listener());
            },
        };
        return document;
    };

    it("offers the newer version found when the application comes back", async () => {
        const update = vi.fn(() => Promise.resolve({} as ServiceWorkerRegistration));
        const {adapter} = setUp({update, waiting: {} as ServiceWorker});
        const document = fakeDocument();
        adapter.watchForeground(document as unknown as Document);
        document.show();
        await vi.waitFor(() => expect(adapter.getState().status).toBe("ready"));
        expect(update).toHaveBeenCalledOnce();
    });

    it("shows nothing when the server has nothing newer or cannot be reached", async () => {
        const {adapter} = setUp({update: () => Promise.reject(new Error("offline"))});
        const listener = vi.fn();
        adapter.subscribe(listener);
        await adapter.checkInBackground();
        expect(listener).not.toHaveBeenCalled();
        expect(adapter.getState().status).toBe("idle");
    });

    it("asks the server at most once a minute", async () => {
        const update = vi.fn(() => Promise.resolve({} as ServiceWorkerRegistration));
        let now = 0;
        const register: RegisterServiceWorker = options => {
            options.onRegisteredSW?.("/sw.js", {installing: null, waiting: null, update} as unknown as ServiceWorkerRegistration);
            return () => Promise.resolve();
        };
        const adapter = new PwaAppUpdateAdapter(register, () => Promise.resolve("2.0.0"), () => now);
        await adapter.checkInBackground();
        now = 59_000;
        await adapter.checkInBackground();
        expect(update).toHaveBeenCalledOnce();
        now = 61_000;
        await adapter.checkInBackground();
        expect(update).toHaveBeenCalledTimes(2);
    });

    it("follows the download it started until the newer version is ready", async () => {
        const worker = fakeInstallingWorker();
        const {adapter} = setUp({installing: worker as unknown as ServiceWorker});
        await adapter.checkInBackground();
        expect(adapter.getState().status).toBe("downloading");
        worker.moveTo("installed");
        expect(adapter.getState().status).toBe("ready");
    });
});
