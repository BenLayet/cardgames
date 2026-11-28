import {vi} from "vitest";
import type {AudioService} from "../services/audio.service.ts";
import {DEFAULT_SETTINGS, type Settings, type SettingsService} from "../services/settings.service.ts";
import type {SpiderSaveService} from "../services/spider-save.service.ts";
import type {SavedSpiderGame, SpiderVariant} from "../model/spider.model.ts";
import type {SpiderRecordsService} from "../services/spider-records.service.ts";
import type {StopwatchService} from "../services/stopwatch.service.ts";
import type {ClockService} from "../services/clock.service.ts";
import type {SpiderWin} from "../model/spider-records.model.ts";
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

// Keeps the won Spider games in memory
export const fakeSpiderRecordsService = (initial: SpiderWin[] = []) => {
    let wins = initial;
    return {
        load: () => wins,
        save: vi.fn((kept: SpiderWin[]) => {
            wins = structuredClone(kept);
        }),
    } satisfies SpiderRecordsService;
};

// A clock that moves only when the test moves it
export const fakeClockService = (start = 1_764_000_000_000) => {
    let time = start;
    return {
        now: () => time,
        advance: (ms: number) => {
            time += ms;
        },
    } satisfies ClockService & { advance: (ms: number) => void };
};

// A stopwatch whose time the test sets: it tells whether it runs
export const fakeStopwatchService = () => {
    let elapsed = 0;
    let isRunning = false;
    return {
        start: vi.fn((elapsedMs: number) => {
            elapsed = elapsedMs;
            isRunning = true;
        }),
        pause: vi.fn(() => {
            isRunning = false;
        }),
        elapsedMs: () => elapsed,
        isRunning: () => isRunning,
        // time played while it runs
        play: (ms: number) => {
            if (isRunning) elapsed += ms;
        },
    } satisfies StopwatchService & { isRunning: () => boolean, play: (ms: number) => void };
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
