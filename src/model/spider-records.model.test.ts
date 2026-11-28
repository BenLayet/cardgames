import {describe, expect, it} from "vitest";

import {rankOf, type SpiderWin, TOP_SIZE, topWins, withWin} from "./spider-records.model.ts";

const win = (moveCount: number, wonAt: number, cardCount = 104, suitCount = 1): SpiderWin => ({cardCount, suitCount, moveCount, wonAt});

describe("spider records", () => {
    it("ranks the games of a kind from the fewest moves, the first made first between equal games", () => {
        const wins = [win(150, 1), win(120, 2), win(150, 0), win(90, 3, 52)];

        expect(topWins(wins, {cardCount: 104, suitCount: 1})).toEqual([win(120, 2), win(150, 0), win(150, 1)]);
        expect(rankOf(wins, win(150, 1))).toBe(3);
        expect(rankOf(wins, win(90, 3, 52))).toBe(1);
    });

    it("keeps only the best games of each kind", () => {
        let wins: SpiderWin[] = [];
        for (let i = 0; i < TOP_SIZE; i++) wins = withWin(wins, win(100 + i, i));
        wins = withWin(wins, win(50, 20, 52));

        const worse = withWin(wins, win(200, 30));
        expect(worse).toHaveLength(TOP_SIZE + 1);
        expect(rankOf(withWin(wins, win(200, 30)), win(200, 30))).toBeNull();

        const better = withWin(wins, win(99, 31));
        expect(rankOf(better, win(99, 31))).toBe(1);
        expect(better).not.toContainEqual(win(109, 9));
        expect(better).toContainEqual(win(50, 20, 52));
    });
});
