export type Settings = {
    language: string | null;
    musicEnabled: boolean;
    soundsEnabled: boolean;
    cardCount: number;
};

export interface SettingsService {
    load(): Settings;
    save(settings: Partial<Settings>): void;
}
