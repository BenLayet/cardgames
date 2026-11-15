import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {initTestStore, type TestStore} from "@softer-components/utils/test-utilities";

import {gameDef, type GameContract} from "./game.component.ts";
import type {Card, StackLocation} from "../../../../model/deck.model.ts";
import {fakeAudioService} from "../../../../test/fakes.ts";
import {TimeoutSchedulerAdapter} from "../../../../adapters/scheduler.adapter.ts";

type Events = GameContract["events"];
const event = <N extends Events["eventName"]>(name: N, payload?: Events["payloads"][N & keyof Events["payloads"]]) =>
    ({name, payload, statePath: []});

let audioService: ReturnType<typeof fakeAudioService>;
let store: TestStore<GameContract>;

beforeEach(() => {
    vi.useFakeTimers();
    audioService = fakeAudioService();
    store = initTestStore(gameDef({audioService, schedulerService: new TimeoutSchedulerAdapter()}));
});
afterEach(() => {
    vi.useRealTimers();
});

const values = () => store.getValues("");
// cards of a stack, from the bottom to the top
const stack = (location: StackLocation): Card[] => (values().cardsWithLocation())
    .filter(c => c.placement.stackLocation === location)
    .sort((a, b) => a.placement.index - b.placement.index)
    .map(c => c.card);

// the last card of each list is on top of the stack, so it is played first
const deal = (player1Cards: Card[], player2Cards: Card[]) =>
    store.when(event("dealCompleted", {player1Cards, player2Cards}));

// player 1 clicks, player 2 answers and the game runs until it waits for the next click
const playRound = async () => {
    await store.when(event("player1Clicked"));
    await vi.runAllTimersAsync();
};

describe("game", () => {
    it("deals half of the requested cards to each player", async () => {
        await store.when(event("dealRequested", 12));
        await vi.runAllTimersAsync();

        expect(stack("player1RemainingCards")).toHaveLength(6);
        expect(stack("player2RemainingCards")).toHaveLength(6);
        expect(values().canPlayer1Play()).toBe(true);
        expect(audioService.startBackgroundMusic).toHaveBeenCalled();
    });

    it("gives both cards to the player with the highest card", async () => {
        await deal(["2S", "KS"], ["3H", "QH"]);

        await playRound();

        expect(stack("player1WonCards")).toEqual(["QH", "KS"]);
        expect(stack("player1RemainingCards")).toEqual(["2S"]);
        expect(stack("player2RemainingCards")).toEqual(["3H"]);
        expect(stack("player1BeingPlayedCards")).toEqual([]);
        expect(values().canPlayer1Play()).toBe(true);
    });

    it("plays a battle with a hidden card when both cards have the same value", async () => {
        await deal(["2S", "3S", "AS", "9S"], ["4H", "5H", "AH", "8H"]);
        await playRound(); // player 1 wins 9S/8H

        await playRound(); // AS vs AH
        expect(values().battleCount()).toBe(1);

        await playRound(); // hidden cards
        expect(values().battleCount()).toBe(1);
        expect(stack("player1BeingPlayedCards")).toEqual(["AS", "3S"]);

        await playRound(); // 2S vs 4H: player 2 wins the whole battle
        expect(values().battleCount()).toBe(0);
        // player 2 had no card left, so the won cards were restacked right away
        expect(stack("player2RemainingCards")).toEqual(["2S", "4H", "3S", "5H", "AS", "AH"]);
        expect(stack("player1RemainingCards")).toEqual(["8H", "9S"]);
        expect(stack("player1BeingPlayedCards")).toEqual([]);
        expect(stack("player2BeingPlayedCards")).toEqual([]);
    });

    it("counts successive battles", async () => {
        await deal(["2S", "KS", "3S", "AS"], ["4H", "KH", "5H", "AH"]);
        await playRound(); // AS vs AH
        await playRound(); // hidden cards
        await playRound(); // KS vs KH
        expect(values().battleCount()).toBe(2);
    });

    it("restacks the won cards when a player has no remaining cards", async () => {
        await deal(["KS"], ["QH", "2H"]);

        await playRound(); // KS vs 2H

        expect(stack("player1WonCards")).toEqual([]);
        expect(stack("player1RemainingCards")).toEqual(["2H", "KS"]);
        expect(values().canPlayer1Play()).toBe(true);
    });

    it("ignores the clicks while a round is being resolved", async () => {
        await deal(["2S", "3S", "KS"], ["4H", "5H", "QH"]);

        await store.when(event("player1Clicked"));
        await store.when(event("player1Clicked"));
        await vi.runAllTimersAsync();

        expect(stack("player1RemainingCards")).toEqual(["2S", "3S"]);
        expect(stack("player1WonCards")).toEqual(["QH", "KS"]);
    });

    it("ends the game with a victory when player 2 has no card left", async () => {
        await deal(["KS"], ["QH"]);

        await playRound();

        expect(values().hasGameEnded()).toBe(true);
        expect(values().hasPlayer1WonGame()).toBe(true);
        expect(audioService.playApplause).toHaveBeenCalled();
    });

    it("ends the game with a defeat when player 1 has no card left", async () => {
        await deal(["QS"], ["KH"]);

        await playRound();

        expect(values().hasPlayer2WonGame()).toBe(true);
        expect(audioService.playCrowdDisappointment).toHaveBeenCalled();
    });

    it("ends the game with a tie when both players run out of cards during a battle", async () => {
        await deal(["AS"], ["AH"]);

        await playRound();

        expect(values().hasGameEnded()).toBe(true);
        expect(values().isTiedGame()).toBe(true);
    });

    it("resets the game when playing again", async () => {
        await deal(["KS"], ["QH"]);
        await playRound();

        await store.when(event("playAgainRequested"));

        expect(values().hasGameEnded()).toBe(false);
        expect(values().cardsWithLocation()).toEqual([]);
    });
});
