import {vi} from "vitest";
import type {AudioService} from "../services/audio.service.ts";
import {DEFAULT_SETTINGS, type Settings, type SettingsService} from "../services/settings.service.ts";

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
