import {DEFAULT_SETTINGS, type Settings, type SettingsService} from "../services/settings.service.ts";

const STORAGE_KEY = "cardgames.settings";

// Stores the settings in the browser; falls back to defaults when storage is unavailable (private mode, blocked...)
export class LocalStorageSettingsAdapter implements SettingsService {
    load(): Settings {
        try {
            const stored: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
            // ignore anything else than an object, such as a value written by hand
            return typeof stored === "object" && stored !== null
                ? {...DEFAULT_SETTINGS, ...(stored as Partial<Settings>)}
                : DEFAULT_SETTINGS;
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
