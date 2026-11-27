import {vi} from "vitest";
import type {AudioService} from "../services/audio.service.ts";
import {DEFAULT_SETTINGS, type Settings, type SettingsService} from "../services/settings.service.ts";
import type {SpiderSaveService} from "../services/spider-save.service.ts";
import type {SavedSpiderGame, SpiderVariant} from "../model/spider.model.ts";
import type {BattleSaveService, BattleVariant, SavedBattleGame} from "../services/battle-save.service.ts";

export const fakeAudioService = () => ({
    stopAll: vi.fn(),
    playApplause: vi.fn(),
    playCrowdDisappointment: vi.fn(),
    playCardSlide: vi.fn(),
    playCheer: vi.fn(),
    setMusicVolume: vi.fn(),
    setSoundsVolume: vi.fn(),
}) satisfies AudioService;

// Keeps the settings in memory so tests can check what was saved
export const fakeSettingsService = (initial: Partial<Settings> = {}) => {
    let settings: Settings = {...DEFAULT_SETTINGS, ...initial};
    return {
        load: () => settings,
        save: vi.fn((changes: Partial<Settings>) => {
            settings = {...settings, ...changes};
        }),
    } satisfies SettingsService;
};

// Keeps the saved games in memory so tests can check what was saved
export const fakeSpiderSaveService = () => {
    const key = ({cardCount, suitCount}: SpiderVariant) => `${cardCount}.${suitCount}`;
    const saved = new Map<string, { variant: SpiderVariant, game: SavedSpiderGame }>();
    return {
        load: (variant: SpiderVariant) => saved.get(key(variant))?.game ?? null,
        save: vi.fn((variant: SpiderVariant, game: SavedSpiderGame) => {
            saved.set(key(variant), {variant, game});
        }),
        clear: vi.fn((variant: SpiderVariant) => {
            saved.delete(key(variant));
        }),
        savedVariants: () => [...saved.values()].map(({variant}) => variant),
    } satisfies SpiderSaveService;
};

// Keeps the Bataille games in memory so tests can check what was saved, one for each kind of game
export const fakeBattleSaveService = () => {
    const saved = new Map<string, { variant: BattleVariant, game: SavedBattleGame }>();
    const key = ({players, cardCount}: BattleVariant) => `${players}.${cardCount}`;
    return {
        load: (variant: BattleVariant) => saved.get(key(variant))?.game ?? null,
        save: vi.fn((variant: BattleVariant, game: SavedBattleGame) => {
            saved.set(key(variant), {variant, game: structuredClone(game)});
        }),
        clear: vi.fn((variant: BattleVariant) => {
            saved.delete(key(variant));
        }),
        savedVariants: () => [...saved.values()].map(({variant}) => variant),
    } satisfies BattleSaveService;
};
