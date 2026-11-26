import {describe, expect, it} from "vitest";

import {maxRounds, simulateGame} from "./game.component.simulation.ts";
import {dealPlayablePiles} from "./game.component.effects.ts";
import {seededRandom} from "../../../../model/deck.model.ts";

describe("Bataille played in memory before the deal", () => {
    it("tells how many rounds a game lasts", () => {
        // KS beats QH, 3H beats 2S, QH beats 3H, then KS beats 2S
        expect(simulateGame([["2S", "KS"], ["3H", "QH"]])).toEqual({outcome: "ends", rounds: 4});
    });

    it("finds a game that comes back to a position it has already been in", () => {
        expect(simulateGame([["KS", "KC", "AD", "KH"], ["AH", "AC", "KD", "AS"]]).outcome).toBe("loops");
    });

    it("finds a game that lasts too long", () => {
        expect(simulateGame([["2S", "KS"], ["3H", "QH"]], 2)).toEqual({outcome: "tooLong", rounds: 3});
    });

    it("lets a whole deck between two players last up to 5,000 rounds, other games up to 1,000", () => {
        expect(maxRounds(52, 2)).toBe(5000);
        expect(maxRounds(32, 2)).toBe(1000);
        expect(maxRounds(52, 3)).toBe(1000);
    });

    it.each([[52, 2], [52, 6], [32, 3], [8, 2]])("deals %i cards to %i players so that the game ends", (cardCount, playerCount) => {
        for (let seed = 1; seed <= 5; seed++) {
            const game = simulateGame(dealPlayablePiles(cardCount, playerCount, seededRandom(seed)), maxRounds(cardCount, playerCount));
            expect(game.outcome).toBe("ends");
            expect(game.rounds).toBeLessThanOrEqual(maxRounds(cardCount, playerCount));
        }
    });
});
