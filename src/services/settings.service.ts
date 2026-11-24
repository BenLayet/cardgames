import type {GameId, SeatKind} from "../model/games.model.ts";

export type Settings = {
    language: string | null;
    musicEnabled: boolean;
    soundsEnabled: boolean;
    // deck size of the battle
    cardCount: number;
    // number of suits of the spider solitaire
    suitCount: number;
    // who sits at each seat, by game
    seats: Partial<Record<GameId, SeatKind[]>>;
};

export const DEFAULT_SETTINGS: Settings = {
    language: null,
    musicEnabled: true,
    soundsEnabled: true,
    cardCount: 32,
    suitCount: 1,
    seats: {},
};

export interface SettingsService {
    load(): Settings;
    save(settings: Partial<Settings>): void;
}
