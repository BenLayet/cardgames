import {DEFAULT_SETTINGS, type Settings, type SettingsService} from "../services/settings.service.ts";

const STORAGE_KEY = "cardgames.settings";

// Stores the settings in the browser; falls back to defaults when storage is unavailable (private mode, blocked...)
export class LocalStorageSettingsAdapter implements SettingsService {
    load(): Settings {
        try {
            const stored: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
            // ignore anything else than an object, such as a value written by hand
            if (typeof stored !== "object" || stored === null) return DEFAULT_SETTINGS;
            const {cardCount, soundsEnabled, ...settings} = stored as Partial<Settings> & {
                cardCount?: unknown, musicEnabled?: unknown, soundsEnabled?: unknown,
            };
            // the music was on or off before: it starts off, like for a new player
            delete settings.musicEnabled;
            // a single card count was kept before, the battle's
            const cardCounts = settings.cardCounts ?? (typeof cardCount === "number" ? {bataille: cardCount} : undefined);
            // the sounds were on or off: off stays off, on becomes the default volume
            const soundsVolume = settings.soundsVolume ?? (soundsEnabled === false ? 0 : undefined);
            return {
                ...DEFAULT_SETTINGS, ...settings,
                ...(cardCounts && {cardCounts}),
                ...(soundsVolume !== undefined && {soundsVolume}),
            };
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
