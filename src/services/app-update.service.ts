// Whether a newer version of the application was deployed, and how far it is on the way to the device
export type AppUpdateStatus =
    | "idle"        // nothing asked yet
    | "checking"    // asking the server
    | "upToDate"    // the server has nothing newer
    | "downloading" // a newer version is being downloaded
    | "ready"       // a newer version is downloaded and waits to replace this one
    | "failed";     // the server could not be reached (offline?) or the application is not installed

export type AppUpdateState = {
    status: AppUpdateStatus,
    // the number of the newer version, once known
    newVersion?: string,
};

export interface AppUpdateService {
    // functions, not methods: views pass them around without the service
    getState: () => AppUpdateState;
    // calls the listener after each change of state, until the returned function is called
    subscribe: (listener: () => void) => () => void;
    // asks the server whether a newer version was deployed
    check: () => Promise<void>;
    // replaces this version by the newer one, which reloads the application
    install: () => void;
}
