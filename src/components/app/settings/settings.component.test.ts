import {describe, expect, it, vi} from "vitest";
import {initTestStore} from "@softer-components/utils/test-utilities";

import {settingsDef} from "./settings.component.ts";
import {fakeAudioService, fakeSettingsService} from "../../../test/fakes.ts";

const setup = (settings = {}) => {
    const audioService = fakeAudioService();
    const settingsService = fakeSettingsService(settings);
    const languageService = {setLanguage: vi.fn()};
    const store = initTestStore(settingsDef({audioService, settingsService, languageService}));
    return {audioService, settingsService, languageService, store};
};

describe("settings", () => {
    it("starts with the stored settings", () => {
        const {store} = setup({language: "en", musicEnabled: false});
        expect(store.getValues("").language()).toBe("en");
        expect(store.getValues("").musicEnabled()).toBe(false);
        expect(store.getValues("").soundsEnabled()).toBe(true);
    });

    it("uses French when the stored language is missing or no longer supported", () => {
        expect(setup({language: null}).store.getValues("").language()).toBe("fr");
        expect(setup({language: "de"}).store.getValues("").language()).toBe("fr");
    });

    it("opens and closes the menu", async () => {
        const {store} = setup();
        await store.when({name: "toggleMenuRequested", statePath: []});
        expect(store.getValues("").isMenuOpen()).toBe(true);
        await store.when({name: "toggleMenuRequested", statePath: []});
        expect(store.getValues("").isMenuOpen()).toBe(false);
    });

    it("changes the language and remembers it", async () => {
        const {store, languageService, settingsService} = setup();
        await store.when({name: "setLanguageRequested", payload: "en", statePath: []});
        expect(store.getValues("").language()).toBe("en");
        expect(languageService.setLanguage).toHaveBeenCalledWith("en");
        expect(settingsService.load().language).toBe("en");
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
