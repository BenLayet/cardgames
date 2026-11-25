import {DEFAULT_SETTINGS, type Settings, type SettingsService} from "../services/settings.service.ts";
import {isStoredObject, migrate, type Migration} from "./migrations.ts";

const STORAGE_KEY = "cardgames.settings";

// Each change of the stored settings adds a migration at the end; settings stored before the
// schemaVersion field existed are version 0
const MIGRATIONS: readonly Migration[] = [
    // 0 → 1: a single card count was kept, the battle's
    ({cardCount, ...settings}) => typeof cardCount === "number" && settings.cardCounts === undefined
        ? {...settings, cardCounts: {bataille: cardCount}}
        : settings,
    // 1 → 2: the music was on or off; it starts off, like for a new player
    settings => {
        const migrated = {...settings};
        delete migrated.musicEnabled;
        return migrated;
    },
    // 2 → 3: the sounds were on or off; off stays off, on becomes the default volume
    ({soundsEnabled, ...settings}) => soundsEnabled === false && settings.soundsVolume === undefined
        ? {...settings, soundsVolume: 0}
        : settings,
];
const SCHEMA_VERSION = MIGRATIONS.length;

// Stores the settings in the browser; falls back to defaults when storage is unavailable (private mode, blocked...)
export class LocalStorageSettingsAdapter implements SettingsService {
    load(): Settings {
        try {
            const text = localStorage.getItem(STORAGE_KEY);
            if (text === null) return DEFAULT_SETTINGS;
            const stored: unknown = JSON.parse(text);
            // ignore anything else than an object, such as a value written by hand
            if (!isStoredObject(stored)) return DEFAULT_SETTINGS;
            const {schemaVersion = 0, ...data} = stored;
            const migrated = migrate(data, Number(schemaVersion), MIGRATIONS);
            if (migrated === null) return DEFAULT_SETTINGS;
            const settings = {...DEFAULT_SETTINGS, ...(migrated as Partial<Settings>)};
            // the migrations run once: the settings are written back in the current version
            if (schemaVersion !== SCHEMA_VERSION) this.write(settings);
            return settings;
        } catch {
            return DEFAULT_SETTINGS;
        }
    }

    save(settings: Partial<Settings>): void {
        this.write({...this.load(), ...settings});
    }

    private write(settings: Settings): void {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({schemaVersion: SCHEMA_VERSION, ...settings}));
        } catch (error) {
            console.error("Failed to save settings:", error);
        }
    }
}
