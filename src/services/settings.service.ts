export type Settings = {
    language: string | null;
    musicEnabled: boolean;
    soundsEnabled: boolean;
};

export interface SettingsService {
    load(): Settings;
    save(settings: Partial<Settings>): void;
}
