export type Settings = {
    language: string | null;
    musicEnabled: boolean;
    soundsEnabled: boolean;
    cardCount: number;
};

export const DEFAULT_SETTINGS: Settings = {
    language: null,
    musicEnabled: true,
    soundsEnabled: true,
    cardCount: 32,
};

export interface SettingsService {
    load(): Settings;
    save(settings: Partial<Settings>): void;
}
