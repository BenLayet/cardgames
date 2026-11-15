import type {Settings, SettingsService} from "../services/settings.service.ts";

const STORAGE_KEY = "cardgames.settings";
const DEFAULT_SETTINGS: Settings = {
    language: null,
    musicEnabled: true,
    soundsEnabled: true,
    cardCount: 32,
};

// Stores the settings in the browser; falls back to defaults when storage is unavailable (private mode, blocked...)
export class LocalStorageSettingsAdapter implements SettingsService {
    load(): Settings {
        try {
            const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
            return {...DEFAULT_SETTINGS, ...stored};
        } catch {
            return DEFAULT_SETTINGS;
        }
    }

    save(settings: Partial<Settings>): void {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({...this.load(), ...settings}));
        } catch (error) {
            console.error("Failed to save settings:", error);
        }
    }
}
