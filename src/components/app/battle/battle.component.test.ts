import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {initTestStore, type TestStore} from "@softer-components/test-utilities";

import {battleDef, type BattleContract} from "./battle.component.ts";
import {fakeAudioService, fakeBattleSaveService, fakeSettingsService} from "../../../test/fakes.ts";
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
    store = initTestStore(battleDef({audioService, settingsService, schedulerService: new TimeoutSchedulerAdapter(), battleSaveService: fakeBattleSaveService()}));
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

    it("goes back to the menu and stops all sounds when the player wants the menu at the end of a game", async () => {
        await store.when({name: "startGameRequested", statePath: setupPath});
        await vi.runAllTimersAsync();

        await store.when({name: "menuRequested", statePath: gamePath});

        expect(store.getValues("").isStarted()).toBe(false);
        expect(audioService.stopAll).toHaveBeenCalled();
    });

    it("deals a new game with the same options when the player wants to play again", async () => {
        await store.when({name: "startGameRequested", statePath: setupPath});
        await vi.runAllTimersAsync();

        await store.when({name: "playAgainRequested", statePath: gamePath});
        await vi.runAllTimersAsync();

        expect(store.getValues("").isStarted()).toBe(true);
        expect(store.getValues("/game").cardsWithLocation()).toHaveLength(16);
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

    it("offers to resume the game left by going back, and resumes it as it was", async () => {
        const battleSaveService = fakeBattleSaveService();
        const battle = initTestStore(battleDef({audioService, settingsService, schedulerService: new TimeoutSchedulerAdapter(), battleSaveService}));
        expect(battle.getValues("").canResume()).toBe(false);
        await battle.when({name: "startGameRequested", statePath: setupPath});
        await vi.runAllTimersAsync();
        await battle.when({name: "player1Clicked", statePath: gamePath});
        await vi.runAllTimersAsync();
        const afterOneRound = battle.getValues("/game").cardsWithLocation();

        await battle.when({name: "goHomeRequested", statePath: []});
        expect(battle.getValues("").canResume()).toBe(true);

        // the application is started again
        const next = initTestStore(battleDef({audioService, settingsService, schedulerService: new TimeoutSchedulerAdapter(), battleSaveService}));
        expect(next.getValues("").canResume()).toBe(true);
        await next.when({name: "resumeRequested", statePath: []});
        await vi.runAllTimersAsync();

        expect(next.getValues("").isStarted()).toBe(true);
        expect(next.getValues("/game").cardsWithLocation()).toEqual(afterOneRound);
        expect(next.getValues("/game").canPlayer1Play()).toBe(true);
    });

    it("resumes the game with the players chosen on the menu, so that a human plays only their own pile", async () => {
        const battleSaveService = fakeBattleSaveService();
        const battle = initTestStore(battleDef({audioService, settingsService, schedulerService: new TimeoutSchedulerAdapter(), battleSaveService}));
        // a game against the computer is left after one round
        await battle.when({name: "startGameRequested", statePath: setupPath});
        await vi.runAllTimersAsync();
        await battle.when({name: "player1Clicked", statePath: gamePath});
        await vi.runAllTimersAsync();
        await battle.when({name: "goHomeRequested", statePath: []});

        // a second human takes the other seat, then the game is resumed
        await battle.when({name: "toggleSeatRequested", payload: 1, statePath: setupPath});
        await battle.when({name: "resumeRequested", statePath: []});
        await vi.runAllTimersAsync();
        expect(battle.getValues("/game").isPlayer2Computer()).toBe(false);

        // the pile of player 1 plays for player 1 only
        await battle.when({name: "player1Clicked", statePath: gamePath});
        await vi.runAllTimersAsync();
        expect(battle.getValues("/game").canPlayer1Play()).toBe(false);
        expect(battle.getValues("/game").canPlayer2Play()).toBe(true);
    });

    it("no longer offers to resume a game that has ended", async () => {
        await store.when({name: "startGameRequested", statePath: setupPath});
        await vi.runAllTimersAsync();
        await store.when({name: "gameEnded", statePath: gamePath});
        await store.when({name: "menuRequested", statePath: gamePath});

        expect(store.getValues("").canResume()).toBe(false);
    });
});
