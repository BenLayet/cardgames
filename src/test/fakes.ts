import {vi} from "vitest";
import type {AudioService} from "../services/audio.service.ts";
import {DEFAULT_SETTINGS, type Settings, type SettingsService} from "../services/settings.service.ts";
import type {SpiderSaveService} from "../services/spider-save.service.ts";
import type {SavedSpiderGame} from "../model/spider.model.ts";

export const fakeAudioService = () => ({
    stopAll: vi.fn(),
    playApplause: vi.fn(),
    playCrowdDisappointment: vi.fn(),
    playCardSlide: vi.fn(),
    startBackgroundMusic: vi.fn(),
    stopBackgroundMusic: vi.fn(),
    setMusicEnabled: vi.fn(),
    setSoundsEnabled: vi.fn(),
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

// Keeps the saved game in memory so tests can check what was saved
export const fakeSpiderSaveService = (initial: Record<number, SavedSpiderGame> = {}) => {
    const saved = new Map(Object.entries(initial).map(([suitCount, game]) => [Number(suitCount), game]));
    return {
        load: (suitCount: number) => saved.get(suitCount) ?? null,
        save: vi.fn((suitCount: number, game: SavedSpiderGame) => {
            saved.set(suitCount, game);
        }),
        clear: vi.fn((suitCount: number) => {
            saved.delete(suitCount);
        }),
        savedSuitCounts: () => [...saved.keys()].sort(),
    } satisfies SpiderSaveService;
};
