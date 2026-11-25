import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";

import {LocalStorageSettingsAdapter} from "./settings.adapter.ts";

const STORAGE_KEY = "cardgames.settings";

describe("settings stored in the browser", () => {
    let stored: Record<string, string>;
    beforeEach(() => {
        stored = {};
        vi.stubGlobal("localStorage", {
            getItem: (key: string) => stored[key] ?? null,
            setItem: (key: string, value: string) => {
                stored[key] = value;
            },
        });
    });
    afterEach(() => vi.unstubAllGlobals());
    const storeRaw = (settings: object) => {
        stored[STORAGE_KEY] = JSON.stringify(settings);
    };

    it("starts with the music off and the sounds in the middle", () => {
        const settings = new LocalStorageSettingsAdapter().load();
        expect(settings.musicVolume).toBe(0);
        expect(settings.soundsVolume).toBe(50);
    });

    it("keeps the sounds off when they were switched off before the volumes", () => {
        storeRaw({musicEnabled: true, soundsEnabled: false});
        const settings = new LocalStorageSettingsAdapter().load();
        expect(settings.soundsVolume).toBe(0);
        expect(settings.musicVolume).toBe(0);
    });

    it("puts the sounds in the middle when they were on before the volumes", () => {
        storeRaw({musicEnabled: false, soundsEnabled: true});
        expect(new LocalStorageSettingsAdapter().load().soundsVolume).toBe(50);
    });

    it("forgets the old switches once the volumes are saved", () => {
        storeRaw({musicEnabled: true, soundsEnabled: false});
        const adapter = new LocalStorageSettingsAdapter();
        adapter.save({musicVolume: 40});
        const saved: unknown = JSON.parse(stored[STORAGE_KEY]);
        expect(saved).not.toHaveProperty("soundsEnabled");
        expect(saved).not.toHaveProperty("musicEnabled");
        expect(adapter.load()).toMatchObject({musicVolume: 40, soundsVolume: 0});
    });
});
