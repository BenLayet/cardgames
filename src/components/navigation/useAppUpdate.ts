import {createContext, useContext, useSyncExternalStore} from "react";
import {useTranslation} from "react-i18next";

import type {AppUpdateService, AppUpdateState} from "../../services/app-update.service.ts";

// Given by the application (main.tsx); views rendered without it, as in tests, never see an update
export const AppUpdateContext = createContext<AppUpdateService | null>(null);

const IDLE: AppUpdateState = {status: "idle"};
const NO_UPDATE: AppUpdateService = {
    getState: () => IDLE,
    subscribe: () => () => undefined,
    check: () => Promise.resolve(),
    install: () => undefined,
};

// The state of the update of the application, kept up to date on screen
export const useAppUpdate = () => {
    const service = useContext(AppUpdateContext) ?? NO_UPDATE;
    const state = useSyncExternalStore(service.subscribe, service.getState);
    return {...state, check: service.check, install: service.install};
};

// What to tell the player about the update; nothing before the first check
export const useAppUpdateMessage = ({status, newVersion}: AppUpdateState): string | undefined => {
    const {t} = useTranslation();
    switch (status) {
        case "idle":
            return undefined;
        case "checking":
            return t("update.checking");
        case "upToDate":
            return t("update.upToDate");
        case "downloading":
            return newVersion ? t("update.downloadingVersion", {version: newVersion}) : t("update.downloading");
        case "ready":
            return newVersion ? t("update.readyVersion", {version: newVersion}) : t("update.ready");
        case "failed":
            return t("update.failed");
    }
};
