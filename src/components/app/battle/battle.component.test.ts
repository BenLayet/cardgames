import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {initTestStore, type TestStore} from "@softer-components/test-utilities";

import {battleDef, type BattleContract} from "./battle.component.ts";
import {fakeAudioService, fakeSettingsService} from "../../../test/fakes.ts";
import {TimeoutSchedulerAdapter} from "../../../adapters/scheduler.adapter.ts";

const setupPath: [string, string][] = [["setup", "0"]];
const gamePath: [string, string][] = [["game", "0"]];

let audioService: ReturnType<typeof fakeAudioService>;
let settingsService: ReturnType<typeof fakeSettingsService>;
let store: TestStore<BattleContract>;

beforeEach(() => {
    vi.useFakeTimers();
    audioService = fakeAudioService();
    settingsService = fakeSettingsService({cardCounts: {bataille: 16}});
    store = initTestStore(battleDef({audioService, settingsService, schedulerService: new TimeoutSchedulerAdapter()}));
});
afterEach(() => {
    vi.useRealTimers();
});

describe("battle", () => {
    it("starts a game with the card count chosen on the start screen", async () => {
        await store.when({name: "startGameRequested", statePath: setupPath});
        await vi.runAllTimersAsync();

        expect(store.getValues("").isStarted()).toBe(true);
        expect(store.getValues("/game").cardsWithLocation()).toHaveLength(16);
    });

    it("goes back home and stops all sounds when the player wants to play again", async () => {
        await store.when({name: "startGameRequested", statePath: setupPath});
        await vi.runAllTimersAsync();

        await store.when({name: "playAgainRequested", statePath: gamePath});

        expect(store.getValues("").isStarted()).toBe(false);
        expect(audioService.stopAll).toHaveBeenCalled();
    });

    it("forgets the pending steps of a round when going home in the middle of it", async () => {
        await store.when({name: "startGameRequested", statePath: setupPath});
        await vi.runAllTimersAsync();
        await store.when({name: "player1Clicked", statePath: gamePath});

        await store.when({name: "goHomeRequested", statePath: []});

        expect(vi.getTimerCount()).toBe(0);
    });

    it("starts a game between two humans when the second seat is a human", async () => {
        await store.when({name: "toggleSeatRequested", payload: 1, statePath: setupPath});
        await store.when({name: "startGameRequested", statePath: setupPath});
        await vi.runAllTimersAsync();

        expect(store.getValues("/game").isPlayer2Computer()).toBe(false);
    });

    it("gives the names typed on the setup screen to the game", async () => {
        await store.when({name: "toggleSeatRequested", payload: 1, statePath: setupPath});
        await store.when({name: "renamePlayerRequested", payload: {index: 0, name: "Tom"}, statePath: setupPath});
        await store.when({name: "startGameRequested", statePath: setupPath});
        await vi.runAllTimersAsync();

        expect(store.getValues("/game").player1Name()).toBe("Tom");
        expect(store.getValues("/game").player2Name()).toBe(null);
    });
});

