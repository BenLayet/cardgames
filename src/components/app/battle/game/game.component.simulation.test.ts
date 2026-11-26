import {describe, expect, it} from "vitest";

import {MAX_ROUNDS, simulateGame} from "./game.component.simulation.ts";
import {dealPlayableGame} from "./game.component.effects.ts";
import {type Card, seededRandom} from "../../../../model/deck.model.ts";

describe("Bataille played in memory before the deal", () => {
    it("tells how many rounds a game lasts", () => {
        // KS beats QH, 3H beats 2S, QH beats 3H, then KS beats 2S
        expect(simulateGame([["2S", "KS"], ["3H", "QH"]], null)).toEqual({outcome: "ends", rounds: 4});
    });

    it("finds a game that never ends when the cards are collected in seat order, and ends once they are shuffled", () => {
        const piles = [["KS", "KC", "AD", "KH"], ["AH", "AC", "KD", "AS"]] satisfies Card[][];
        expect(simulateGame(piles, null).outcome).toBe("tooLong");
        expect(simulateGame(piles, 42).outcome).toBe("ends");
    });

    it("finds a game that lasts too long", () => {
        expect(simulateGame([["2S", "KS"], ["3H", "QH"]], null, 2)).toEqual({outcome: "tooLong", rounds: 3});
    });

    it.each([[52, 2], [52, 6], [32, 3], [8, 2]])("deals %i cards to %i players so that the game ends", (cardCount, playerCount) => {
        for (let seed = 1; seed <= 5; seed++) {
            const {piles, dealSeed} = dealPlayableGame(cardCount, playerCount, seededRandom(seed));
            const game = simulateGame(piles, dealSeed);
            expect(game.outcome).toBe("ends");
            expect(game.rounds).toBeLessThanOrEqual(MAX_ROUNDS);
        }
    });
});
