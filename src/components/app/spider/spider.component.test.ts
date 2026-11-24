import {beforeEach, describe, expect, it} from "vitest";
import {initTestStore, type TestStore} from "@softer-components/test-utilities";

import {spiderDef, type SpiderContract} from "./spider.component.ts";
import {fakeAudioService, fakeSettingsService} from "../../../test/fakes.ts";

const setupPath: [string, string][] = [["setup", "0"]];
const gamePath: [string, string][] = [["game", "0"]];

let audioService: ReturnType<typeof fakeAudioService>;
let store: TestStore<SpiderContract>;

beforeEach(() => {
    audioService = fakeAudioService();
    store = initTestStore(spiderDef({audioService, settingsService: fakeSettingsService({suitCount: 4})}));
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
});
