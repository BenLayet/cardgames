import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {initTestStore, type TestStore} from "@softer-components/utils/test-utilities";

import {battleDef, type BattleContract} from "./battle.component.ts";
import {fakeAudioService, fakeSettingsService} from "../../../test/fakes.ts";
import {TimeoutSchedulerAdapter} from "../../../adapters/scheduler.adapter.ts";

const startScreenPath: [string, string][] = [["startScreen", "0"]];
const gamePath: [string, string][] = [["game", "0"]];

let audioService: ReturnType<typeof fakeAudioService>;
let settingsService: ReturnType<typeof fakeSettingsService>;
let store: TestStore<BattleContract>;

beforeEach(() => {
    vi.useFakeTimers();
    audioService = fakeAudioService();
    settingsService = fakeSettingsService({cardCount: 16});
    store = initTestStore(battleDef({audioService, settingsService, schedulerService: new TimeoutSchedulerAdapter()}));
});
afterEach(() => {
    vi.useRealTimers();
});

describe("battle", () => {
    it("starts a game with the card count chosen on the start screen", async () => {
        await store.when({name: "startGameRequested", statePath: startScreenPath});
        await vi.runAllTimersAsync();

        expect(store.getValues("").isStarted()).toBe(true);
        expect(store.getValues("/game").cardsWithLocation()).toHaveLength(16);
    });

    it("goes back home and stops all sounds when the player wants to play again", async () => {
        await store.when({name: "startGameRequested", statePath: startScreenPath});
        await vi.runAllTimersAsync();

        await store.when({name: "playAgainRequested", statePath: gamePath});

        expect(store.getValues("").isStarted()).toBe(false);
        expect(audioService.stopAll).toHaveBeenCalled();
        expect(audioService.stopBackgroundMusic).toHaveBeenCalled();
    });

    it("forgets the pending steps of a round when going home in the middle of it", async () => {
        await store.when({name: "startGameRequested", statePath: startScreenPath});
        await vi.runAllTimersAsync();
        await store.when({name: "player1Clicked", statePath: gamePath});

        await store.when({name: "goHomeRequested", statePath: []});

        expect(vi.getTimerCount()).toBe(0);
    });
});
