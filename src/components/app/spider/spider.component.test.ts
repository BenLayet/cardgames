import {beforeEach, describe, expect, it} from "vitest";
import {initTestStore, type TestStore} from "@softer-components/test-utilities";

import {spiderDef, type SpiderContract} from "./spider.component.ts";
import {fakeAudioService, fakeSettingsService, fakeSpiderSaveService} from "../../../test/fakes.ts";

const setupPath: [string, string][] = [["setup", "0"]];
const gamePath: [string, string][] = [["game", "0"]];

let audioService: ReturnType<typeof fakeAudioService>;
let store: TestStore<SpiderContract>;

beforeEach(() => {
    audioService = fakeAudioService();
    store = initTestStore(spiderDef({
        audioService,
        settingsService: fakeSettingsService({suitCount: 4}),
        spiderSaveService: fakeSpiderSaveService(),
    }));
});

describe("spider", () => {
    it("starts a game with the number of suits chosen on the setup screen", async () => {
        await store.when({name: "startGameRequested", statePath: setupPath});

        expect(store.getValues("").isStarted()).toBe(true);
        const suits = new Set(store.getValues("/game").columns().flat().map(c => c.card.charAt(1)));
        expect(suits.size).toBe(4);
    });

    it("goes back to the setup screen and stops the music when the player wants to play again", async () => {
        await store.when({name: "startGameRequested", statePath: setupPath});

        await store.when({name: "playAgainRequested", statePath: gamePath});

        expect(store.getValues("").isStarted()).toBe(false);
        expect(audioService.stopBackgroundMusic).toHaveBeenCalled();
    });

    it("offers to resume a saved game, and resumes it", async () => {
        const spiderSaveService = fakeSpiderSaveService();
        const first = initTestStore(spiderDef({audioService, settingsService: fakeSettingsService(), spiderSaveService}));
        expect(first.getValues("").canResume()).toBe(false);
        await first.when({name: "startGameRequested", statePath: setupPath});
        const dealt = first.getValues("/game").columns();

        // the application is started again
        const next = initTestStore(spiderDef({audioService, settingsService: fakeSettingsService(), spiderSaveService}));
        expect(next.getValues("").canResume()).toBe(true);
        await next.when({name: "resumeRequested", statePath: []});

        expect(next.getValues("").isStarted()).toBe(true);
        expect(next.getValues("/game").columns()).toEqual(dealt);
    });

    it("no longer offers to resume a game that was won", async () => {
        await store.when({name: "startGameRequested", statePath: setupPath});
        expect(store.getValues("").canResume()).toBe(false);
        await store.when({name: "gameEnded", statePath: gamePath});
        await store.when({name: "playAgainRequested", statePath: gamePath});

        expect(store.getValues("").canResume()).toBe(false);
    });

    it("offers to resume the game left by going home", async () => {
        await store.when({name: "startGameRequested", statePath: setupPath});
        await store.when({name: "goHomeRequested", statePath: []});

        expect(store.getValues("").canResume()).toBe(true);
    });
});
