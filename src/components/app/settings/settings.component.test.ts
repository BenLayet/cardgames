import {describe, expect, it, vi} from "vitest";
import {initTestStore} from "@softer-components/test-utilities";

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
        const {store} = setup({language: "en", musicVolume: 30});
        expect(store.getValues("").language()).toBe("en");
        expect(store.getValues("").musicVolume()).toBe(30);
        expect(store.getValues("").soundsVolume()).toBe(50);
    });

    it("starts with the music off and the sounds in the middle", () => {
        const {store} = setup();
        expect(store.getValues("").musicVolume()).toBe(0);
        expect(store.getValues("").soundsVolume()).toBe(50);
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

    it("changes the music volume and remembers it", async () => {
        const {store, audioService, settingsService} = setup();
        await store.when({name: "setMusicVolumeRequested", payload: 70, statePath: []});
        expect(store.getValues("").musicVolume()).toBe(70);
        expect(audioService.setMusicVolume).toHaveBeenCalledWith(70);
        expect(settingsService.load().musicVolume).toBe(70);
    });

    it("turns the sounds off and remembers it", async () => {
        const {store, audioService, settingsService} = setup();
        await store.when({name: "setSoundsVolumeRequested", payload: 0, statePath: []});
        expect(store.getValues("").soundsVolume()).toBe(0);
        expect(audioService.setSoundsVolume).toHaveBeenCalledWith(0);
        expect(settingsService.load().soundsVolume).toBe(0);
    });
});
