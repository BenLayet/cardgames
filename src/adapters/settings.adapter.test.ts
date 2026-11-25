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

    it("keeps the card count of the battle chosen when there was a single one", () => {
        storeRaw({cardCount: 16});
        expect(new LocalStorageSettingsAdapter().load().cardCounts).toEqual({bataille: 16});
    });

    it("writes the migrated settings back once, with their version", () => {
        storeRaw({cardCount: 16, musicEnabled: true, soundsEnabled: false});
        new LocalStorageSettingsAdapter().load();
        const saved = JSON.parse(stored[STORAGE_KEY]) as Record<string, unknown>;
        expect(saved).toMatchObject({schemaVersion: 3, cardCounts: {bataille: 16}, soundsVolume: 0});
        expect(saved).not.toHaveProperty("cardCount");
    });

    it("reads the settings of the current version as they are", () => {
        storeRaw({schemaVersion: 3, musicVolume: 70, soundsEnabled: false});
        const settings = new LocalStorageSettingsAdapter().load();
        expect(settings.musicVolume).toBe(70);
        expect(settings.soundsVolume).toBe(50);
    });

    it("starts from the defaults with settings written by a newer version", () => {
        storeRaw({schemaVersion: 99, musicVolume: 70});
        expect(new LocalStorageSettingsAdapter().load().musicVolume).toBe(0);
    });
});
