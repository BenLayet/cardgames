import type {GameId, SeatKind} from "../model/games.model.ts";

export type Settings = {
    language: string | null;
    // from 0 (off) to 100 (loudest)
    musicVolume: number;
    soundsVolume: number;
    // deck size, by game
    cardCounts: Partial<Record<GameId, number>>;
    // number of suits of the spider solitaire
    suitCount: number;
    // who sits at each seat, by game
    seats: Partial<Record<GameId, SeatKind[]>>;
    // the names typed for each seat, shared by all the games ("" when none was typed)
    playerNames: string[];
};

export const DEFAULT_SETTINGS: Settings = {
    language: null,
    musicVolume: 0,
    soundsVolume: 50,
    cardCounts: {bataille: 32, spider: 104},
    suitCount: 1,
    seats: {},
    playerNames: [],
};

export interface SettingsService {
    load(): Settings;
    save(settings: Partial<Settings>): void;
}
