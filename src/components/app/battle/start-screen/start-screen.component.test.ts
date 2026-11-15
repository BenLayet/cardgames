import {describe, expect, it} from "vitest";
import {initTestStore} from "@softer-components/utils/test-utilities";

import {startScreenDef} from "./start-screen.component.ts";
import {fakeAudioService, fakeSettingsService} from "../../../../test/fakes.ts";

const setup = (settings = {}) => {
    const audioService = fakeAudioService();
    const settingsService = fakeSettingsService(settings);
    const store = initTestStore(startScreenDef({audioService, settingsService}));
    return {audioService, settingsService, store};
};

describe("start screen", () => {
    it("starts with the stored settings", () => {
        const {store} = setup({cardCount: 16, musicEnabled: false});
        expect(store.getValues().cardCount()).toBe(16);
        expect(store.getValues().musicEnabled()).toBe(false);
    });

    it("ignores a stored card count that is no longer offered", () => {
        const {store} = setup({cardCount: 20});
        expect(store.getValues().cardCount()).toBe(32);
    });

    it("remembers the chosen card count", async () => {
        const {store, settingsService} = setup();
        await store.when({name: "setCardCountRequested", payload: 52, statePath: []});
        expect(store.getValues().cardCount()).toBe(52);
        expect(settingsService.load().cardCount).toBe(52);
    });

    it("turns the music off and remembers it", async () => {
        const {store, audioService, settingsService} = setup();
        await store.when({name: "toggleMusicRequested", statePath: []});
        expect(audioService.setMusicEnabled).toHaveBeenCalledWith(false);
        expect(settingsService.load().musicEnabled).toBe(false);
    });

    it("turns the sounds off and remembers it", async () => {
        const {store, audioService, settingsService} = setup();
        await store.when({name: "toggleSoundsRequested", statePath: []});
        expect(audioService.setSoundsEnabled).toHaveBeenCalledWith(false);
        expect(settingsService.load().soundsEnabled).toBe(false);
    });
});
