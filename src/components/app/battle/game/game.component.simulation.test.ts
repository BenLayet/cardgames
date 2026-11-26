import {describe, expect, it} from "vitest";

import {NEVER_ENDING_ROUNDS, simulateGame} from "./game.component.simulation.ts";
import {dealPlayableGame} from "./game.component.effects.ts";
import {type Card, seededRandom} from "../../../../model/deck.model.ts";

describe("Bataille played in memory before the deal", () => {
    it("tells how many rounds a game lasts", () => {
        // KS beats QH, 3H beats 2S, QH beats 3H, then KS beats 2S
        expect(simulateGame([["2S", "KS"], ["3H", "QH"]], null)).toEqual({outcome: "ends", rounds: 4});
    });

    it("finds a game that never ends when the cards are collected in seat order, as soon as a position comes back", () => {
        const piles = [["KS", "KC", "AD", "KH"], ["AH", "AC", "KD", "AS"]] satisfies Card[][];
        const game = simulateGame(piles, null);
        expect(game.outcome).toBe("neverEnds");
        expect(game.rounds).toBeLessThan(100);
        expect(simulateGame(piles, 42).outcome).toBe("ends");
    });

    it("takes a game still going on after the guard as never ending", () => {
        expect(simulateGame([["2S", "KS"], ["3H", "QH"]], null, 2)).toEqual({outcome: "neverEnds", rounds: 3});
    });

    it("deals long games too: no limit below the guard against games that never end", () => {
        expect(NEVER_ENDING_ROUNDS).toBe(20_000);
        const lengths = Array.from({length: 200}, (_, seed) => {
            const {piles, dealSeed} = dealPlayableGame(52, 2, seededRandom(seed + 1));
            return simulateGame(piles, dealSeed).rounds;
        });
        expect(Math.max(...lengths)).toBeGreaterThan(1000);
    });

    it.each([[52, 2], [52, 6], [32, 3], [8, 2]])("deals %i cards to %i players so that the game ends", (cardCount, playerCount) => {
        for (let seed = 1; seed <= 5; seed++) {
            const {piles, dealSeed} = dealPlayableGame(cardCount, playerCount, seededRandom(seed));
            const game = simulateGame(piles, dealSeed);
            expect(game.outcome).toBe("ends");
        }
    });
});
