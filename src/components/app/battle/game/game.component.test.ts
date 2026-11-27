import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {initTestStore, type TestStore} from "@softer-components/test-utilities";
import type {ExtractEventNameUnion, ExtractPayload} from "@softer-components/types";

import {gameDef, type GameContract} from "./game.component.ts";
import {type Card, seededRandom} from "../../../../model/deck.model.ts";
import type {BattleStackLocation} from "./game.component.state.ts";
import {fakeAudioService, fakeBattleSaveService} from "../../../../test/fakes.ts";
import {TimeoutSchedulerAdapter} from "../../../../adapters/scheduler.adapter.ts";
import {dealPiles, dealPlayableGame} from "./game.component.effects.ts";
import {simulateGame} from "./game.component.simulation.ts";
import {DELAYS_MS} from "./game.component.timings.ts";

const event = <N extends ExtractEventNameUnion<GameContract>>(name: N, payload?: ExtractPayload<GameContract, N>) =>
    ({name, payload, statePath: []});

let audioService: ReturnType<typeof fakeAudioService>;
let store: TestStore<GameContract>;

beforeEach(() => {
    vi.useFakeTimers();
    audioService = fakeAudioService();
    store = initTestStore(gameDef({audioService, schedulerService: new TimeoutSchedulerAdapter(), battleSaveService: fakeBattleSaveService()}));
});
afterEach(() => {
    vi.useRealTimers();
});

const values = () => store.getValues("");
// cards of a stack, from the bottom to the top
const stack = (location: BattleStackLocation): Card[] => (values().cardsWithLocation())
    .filter(c => c.placement.stackLocation === location)
    .sort((a, b) => a.placement.index - b.placement.index)
    .map(c => c.card);
const pile = (seat: number) => stack(`seat${seat}Pile`);
const played = (seat: number) => stack(`seat${seat}Played`);

// the last card of each list is on top of the pile, so it is played first
const deal = (...piles: Card[][]) => store.when(event("dealCompleted", {piles, setAsideCount: 0}));
const dealToHumans = async (...piles: Card[][]) => {
    await store.when(event("dealRequested", {cardCount: 12, playerCount: piles.length, isSolo: false, playerNames: piles.map(() => null)}));
    await vi.runAllTimersAsync();
    await deal(...piles);
};
const click = (seat: number) => store.when(event("playerClicked", seat));
// the game runs until it waits for a tap, without the steps of a collection done on their own when nobody taps
const settle = () => vi.advanceTimersByTimeAsync(DELAYS_MS.autoCollect - 1);

// once a round is won, the player taps until every layer of cards is collected, the hidden ones turned over first
const collect = async () => {
    while (values().canRevealHiddenCards() || values().canCollectCards()) {
        await click(0);
        await vi.runAllTimersAsync();
    }
};
// the player clicks, the computer answers and the game runs until it waits for the next click
const playRound = async () => {
    await click(0);
    await vi.runAllTimersAsync();
    await collect();
};
// each human plays in turn, then the game runs until it waits for the next clicks
const everyonePlays = async (...seats: number[]) => {
    for (const seat of seats) await click(seat);
    await vi.runAllTimersAsync();
    await collect();
};

describe("game", () => {
    it("says who won the last round and how many cards each player holds", async () => {
        await deal(["2S", "KS"], ["3H", "QH"]);
        expect(values().hasPlayed()).toBe(false);
        expect(values().lastRoundWinner()).toBe(null);

        await playRound();

        expect(values().hasPlayed()).toBe(true);
        expect(values().lastRoundWinner()).toBe(0);
        expect(values().lastWonCount()).toBe(2);
        expect(values().seats().map(seat => seat.cardCount)).toEqual([3, 1]);
    });

    it("deals the same number of cards to each player and sets the others aside", async () => {
        await store.when(event("dealRequested", {cardCount: 32, playerCount: 5, isSolo: false, playerNames: [null, null, null, null, null]}));
        await vi.runAllTimersAsync();

        expect([0, 1, 2, 3, 4].map(seat => pile(seat).length)).toEqual([6, 6, 6, 6, 6]);
        expect(values().canPlay()).toEqual([true, true, true, true, true]);
    });

    it("splits a deck into equal piles", () => {
        expect(dealPiles([1, 2, 3, 4, 5, 6, 7], 3)).toEqual([[1, 2], [3, 4], [5, 6]]);
    });

    it("puts the cards of the round under the pile of the player with the highest card", async () => {
        await deal(["2S", "KS"], ["3H", "QH"]);

        await playRound();

        expect(pile(0)).toEqual(["KS", "QH", "2S"]);
        expect(pile(1)).toEqual(["3H"]);
        expect(played(0)).toEqual([]);
        expect(values().canPlay()).toEqual([true, true]);
    });

    it("plays a battle with a face down card when both cards have the same value", async () => {
        await deal(["2S", "3S", "AS", "9S"], ["4H", "5H", "AH", "8H"]);
        await playRound(); // player 1 wins 9S/8H

        await playRound(); // AS vs AH
        expect(values().battleCount()).toBe(1);
        expect(values().seats().map(seat => seat.isTied)).toEqual([true, true]);

        await playRound(); // face down cards
        expect(values().battleCount()).toBe(1);
        expect(played(0)).toEqual(["AS", "3S"]);

        await playRound(); // 2S vs 4H: player 2 wins the whole battle
        expect(values().battleCount()).toBe(0);
        // collected layer by layer from the top, each layer under the ones before, in seat order
        expect(pile(1)).toEqual(["AS", "AH", "3S", "5H", "2S", "4H"]);
        expect(pile(0)).toEqual(["9S", "8H"]);
        expect(played(0)).toEqual([]);
        expect(played(1)).toEqual([]);
    });

    it("lays a card face up at once, and the face down card of a battle face down", async () => {
        await dealToHumans(["2S", "3S", "AS"], ["4H", "5H", "AH"]);
        const faceUp = (seat: number) => values().cardsWithLocation()
            .filter(c => c.placement.stackLocation === `seat${seat}Played`)
            .sort((a, b) => a.placement.index - b.placement.index)
            .map(c => c.placement.faceUp);
        await click(0);
        expect(faceUp(0)).toEqual([true]);
        expect(faceUp(1)).toEqual([]);
        await everyonePlays(1); // AS vs AH: a battle
        await everyonePlays(0, 1);
        expect(faceUp(0)).toEqual([true, false]);
    });

    it("collects the cards of a battle layer by layer from the top, turning the face down layer over first", async () => {
        await dealToHumans(["2S", "3S", "AS"], ["4H", "5H", "AH"]);
        await everyonePlays(0, 1); // AS vs AH
        await everyonePlays(0, 1); // face down cards 3S and 5H
        await click(0);
        await click(1); // 2S vs 4H
        await settle();
        const hiddenCount = () => values().cardsWithLocation().filter(c => c.placement.stackLocation.endsWith("Played") && !c.placement.faceUp).length;
        // the round is won, but nothing moves without a tap
        expect(values().roundWinner()).toBe(1);
        expect(hiddenCount()).toBe(2);
        expect(values().canCollectCards()).toBe(true);
        expect(values().canRevealHiddenCards()).toBe(false);

        // any player taps: the top layer, 2S and 4H, goes to the winner
        await click(0);
        await settle();
        expect(played(0)).toEqual(["AS", "3S"]);
        expect(played(1)).toEqual(["AH", "5H"]);
        expect([...pile(1)].sort()).toEqual(["2S", "4H"]);
        // the next layer is face down: a tap turns both cards over at once
        expect(values().canRevealHiddenCards()).toBe(true);
        await click(1);
        expect(hiddenCount()).toBe(0);
        expect(played(0)).toHaveLength(2);
        // then a tap for each layer
        await click(0);
        await settle();
        expect(played(0)).toEqual(["AS"]);
        expect(pile(1)).toHaveLength(4);
        // each layer goes under the cards collected before
        expect([...pile(1)].slice(2).sort()).toEqual(["2S", "4H"]);
        expect(values().hasGameEnded()).toBe(false);
        await click(0);
        await settle();
        expect(played(0)).toEqual([]);
        expect(pile(1)).toHaveLength(6);
        expect(values().hasGameEnded()).toBe(true);
    });

    it("tells which card won the round until it is collected", async () => {
        await dealToHumans(["2S", "3S", "AS"], ["4H", "5H", "AH"]);
        await click(0);
        await click(1); // AS vs AH: a battle, no winning card
        await settle();
        expect(values().winningCard()).toBeNull();
        await everyonePlays(0, 1); // face down cards 3S and 5H
        await click(0);
        await click(1); // 2S vs 4H
        await settle();
        expect(values().winningCard()).toBe("4H");
        // the winning card goes with the top layer
        await click(0);
        expect(values().winningCard()).toBeNull();
    });

    it("collects the cards on its own, step by step, when nobody taps", async () => {
        await dealToHumans(["2S", "3S", "AS"], ["4H", "5H", "AH"]);
        await everyonePlays(0, 1); // AS vs AH
        await everyonePlays(0, 1); // face down cards 3S and 5H
        await click(0);
        await click(1); // 2S vs 4H
        await settle();
        expect(values().canCollectCards()).toBe(true);
        // the top layer goes after the delay
        await vi.advanceTimersByTimeAsync(DELAYS_MS.autoCollect);
        expect(played(1)).toEqual(["AH", "5H"]);
        // a tap turns the hidden layer over at once, and the delay starts again for the next step
        await click(0);
        expect(values().canCollectCards()).toBe(true);
        await vi.advanceTimersByTimeAsync(DELAYS_MS.autoCollect - 1);
        expect(played(1)).toEqual(["AH", "5H"]);
        await vi.advanceTimersByTimeAsync(1);
        expect(played(1)).toEqual(["AH"]);
        await vi.runAllTimersAsync();
        expect(pile(1)).toHaveLength(6);
        expect(values().hasGameEnded()).toBe(true);
    });

    it("collects a round without a battle in a single tap", async () => {
        await dealToHumans(["2S", "3S"], ["4H", "AH"]);
        await click(0);
        await click(1);
        await settle();
        expect(values().canCollectCards()).toBe(true);
        await click(1);
        await settle();
        expect(played(0)).toEqual([]);
        expect(played(1)).toEqual([]);
        expect(pile(1)).toHaveLength(3);
        expect(values().canPlay()).toEqual([true, true]);
    });

    it.each([1, 2, 3, 4, 5, 6])("plays the game the way it was played in memory before the deal (seed %i)", async seed => {
        const {piles, dealSeed} = dealPlayableGame(12, 2, seededRandom(seed));
        await store.when(event("dealRequested", {cardCount: 12, playerCount: 2, isSolo: false, playerNames: [null, null]}));
        await vi.runAllTimersAsync();
        await store.when(event("dealCompleted", {piles: piles.map(p => [...p]), setAsideCount: 0, dealSeed}));
        let battles = 0;
        while (!values().hasGameEnded()) {
            await everyonePlays(0, 1);
            battles = Math.max(battles, values().battleCount());
        }
        expect(values().roundNumber() - 1).toBe(simulateGame(piles, dealSeed).rounds);
        // each of these deals has at least one battle, collected layer by layer
        expect(battles).toBeGreaterThan(0);
    });

    it("counts successive battles", async () => {
        await deal(["2S", "KS", "3S", "AS"], ["4H", "KH", "5H", "AH"]);
        await playRound(); // AS vs AH
        await playRound(); // face down cards
        await playRound(); // KS vs KH
        expect(values().battleCount()).toBe(2);
    });

    it("ignores the clicks while a round is being resolved", async () => {
        await deal(["2S", "3S", "KS"], ["4H", "5H", "QH"]);

        await click(0);
        await click(0);
        await vi.runAllTimersAsync();
        await collect();

        expect(pile(0)).toEqual(["KS", "QH", "2S", "3S"]);
    });

    describe("the computer never plays before the player", () => {
        it("when the player double clicks on a face down card of a battle", async () => {
            await deal(["2S", "3S", "KS"], ["5H", "4H", "KH"]);
            await playRound(); // KS vs KH: battle

            await click(0); // plays the face down card
            await vi.advanceTimersByTimeAsync(50);
            await click(0); // ignored
            await vi.advanceTimersByTimeAsync(200);

            expect(played(0)).toEqual(["KS", "3S"]);
            expect(played(1)).toEqual(["KH", "4H"]);
        });

        it("when the player clicks just before the cards are dealt", async () => {
            await store.when(event("dealRequested", {cardCount: 12, playerCount: 2, isSolo: true, playerNames: [null, null]}));
            await vi.advanceTimersByTimeAsync(450);
            await click(0); // ignored
            await vi.advanceTimersByTimeAsync(200);

            expect(played(0)).toEqual([]);
            expect(played(1)).toEqual([]);
        });
    });

    it("lets the computer lay its face down card when the player has a single card left for the battle", async () => {
        await deal(["2S", "KS"], ["4H", "3H", "KH"]);
        await playRound(); // KS vs KH: battle, the player has one card left

        expect(played(0)).toEqual(["KS"]);
        expect(played(1)).toEqual(["KH", "3H"]);
        expect(values().canPlay()).toEqual([true, true]);
        // the single card of the player is played face up
        await playRound();
        // the top layer is 4H alone, then 2S with the face down 3H, then KS and KH
        expect(pile(1)).toEqual(["KS", "KH", "2S", "3H", "4H"]);
        expect(values().hasGameEnded()).toBe(true);
    });

    it("ends the game with a victory when the computer has no card left", async () => {
        await deal(["KS"], ["QH"]);

        await playRound();

        expect(values().hasGameEnded()).toBe(true);
        expect(values().gameWinner()).toBe(0);
        expect(audioService.playApplause).toHaveBeenCalled();
    });

    it("ends the game with a defeat when the player has no card left", async () => {
        await deal(["QS"], ["KH"]);

        await playRound();

        expect(values().gameWinner()).toBe(1);
        expect(audioService.playCrowdDisappointment).toHaveBeenCalled();
    });

    it("ends the game with a tie when both players run out of cards during a battle", async () => {
        await deal(["AS"], ["AH"]);

        await playRound();

        expect(values().hasGameEnded()).toBe(true);
        expect(values().isTiedGame()).toBe(true);
    });

    describe("between humans", () => {
        it("waits for player 2 to play instead of answering for them", async () => {
            await dealToHumans(["2S", "KS"], ["3H", "QH"]);

            await playRound();
            expect(played(0)).toEqual(["KS"]);
            expect(played(1)).toEqual([]);

            await everyonePlays(1);
            expect(pile(0)).toEqual(["KS", "QH", "2S"]);
        });

        it("lets player 2 play first", async () => {
            await dealToHumans(["2S", "KS"], ["3H", "QH"]);

            await everyonePlays(1, 0);

            expect(pile(0)).toEqual(["KS", "QH", "2S"]);
        });

        it("applauds player 2 when they win", async () => {
            await dealToHumans(["QS"], ["KH"]);

            await everyonePlays(1, 0);

            expect(values().gameWinner()).toBe(1);
            expect(audioService.playApplause).toHaveBeenCalled();
            expect(audioService.playCrowdDisappointment).not.toHaveBeenCalled();
        });

        it("keeps the same players when playing again", async () => {
            await dealToHumans(["KS"], ["QH"]);

            await store.when(event("playAgainRequested"));

            expect(values().isSolo()).toBe(false);
        });
    });

    describe("with more than two players", () => {
        it("gives every card of the round to the highest one", async () => {
            await dealToHumans(["2S", "7C"], ["3H", "KH"], ["4D", "TD"]);

            await everyonePlays(0, 1, 2);

            expect(pile(1)).toEqual(["7C", "KH", "TD", "3H"]);
            expect(values().lastWonCount()).toBe(3);
        });

        it("plays the battle between the tied players only, and gives them the cards of the others", async () => {
            await dealToHumans(["2S", "3S", "KS"], ["4H", "5H", "KH"], ["6D", "8D", "7C", "TD"], ["9C", "8C", "7D"]);

            await everyonePlays(0, 1, 2, 3); // KS, KH, TD, 7D: battle between seats 0 and 1
            expect(values().seats().map(seat => [seat.isTied, seat.isDimmed])).toEqual([[true, false], [true, false], [false, true], [false, true]]);
            expect(values().canPlay()).toEqual([true, true, false, false]);

            await click(2); // a dimmed player does not play
            expect(played(2)).toEqual(["TD"]);

            await everyonePlays(0, 1); // face down cards
            await everyonePlays(0, 1); // 2S vs 4H
            expect(pile(1)).toEqual(["KS", "KH", "TD", "7D", "3S", "5H", "2S", "4H"]);
            expect(values().canPlay()).toEqual([false, true, true, true]);
        });

        it("lets a tied player without any card left lose the battle", async () => {
            await dealToHumans(["KS"], ["2H", "3H", "KH"], ["4D", "5D"]);

            await everyonePlays(0, 1, 2); // KS vs KH: player 1 has no card left

            expect(values().roundWinner()).toBe(null);
            expect(pile(1)).toEqual(["KS", "KH", "5D", "2H", "3H"]);
            expect(values().seats()[0].rank).toBe(3);
            expect(values().seats()[0].eliminatedRound).toBe(1);
        });

        it("ends the game when one player has all the cards, with a place for each player", async () => {
            await dealToHumans(["KS"], ["3H", "AH"], ["4D"]);

            await everyonePlays(0, 1, 2);

            expect(values().hasGameEnded()).toBe(true);
            expect(values().seats().map(seat => seat.rank)).toEqual([2, 1, 2]);
            expect(values().ranking()).toEqual([1, 0, 2]);
        });

        it("sets aside the cards of a battle that no tied player can go on with", async () => {
            await dealToHumans(["KS"], ["KH"], ["4D", "5D"]);

            await everyonePlays(0, 1, 2);

            expect(values().gameWinner()).toBe(2);
            expect(pile(2)).toEqual(["4D"]);
        });
    });

    it("resets the game when playing again", async () => {
        await deal(["KS"], ["QH"]);
        await playRound();

        await store.when(event("playAgainRequested"));

        expect(values().hasGameEnded()).toBe(false);
        expect(values().cardsWithLocation()).toEqual([]);
    });
});
