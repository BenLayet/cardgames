import {DEFAULT_SETTINGS, type Settings, type SettingsService} from "../services/settings.service.ts";

const STORAGE_KEY = "cardgames.settings";

// Stores the settings in the browser; falls back to defaults when storage is unavailable (private mode, blocked...)
export class LocalStorageSettingsAdapter implements SettingsService {
    load(): Settings {
        try {
            const stored: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
            // ignore anything else than an object, such as a value written by hand
            if (typeof stored !== "object" || stored === null) return DEFAULT_SETTINGS;
            const {cardCount, ...settings} = stored as Partial<Settings> & { cardCount?: unknown };
            // a single card count was kept before, the battle's
            const cardCounts = settings.cardCounts ?? (typeof cardCount === "number" ? {bataille: cardCount} : undefined);
            return {...DEFAULT_SETTINGS, ...settings, ...(cardCounts && {cardCounts})};
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
