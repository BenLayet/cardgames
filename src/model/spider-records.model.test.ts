import {describe, expect, it} from "vitest";

import {formatDuration, rankOf, type SpiderWin, TOP_SIZE, topWins, withWin} from "./spider-records.model.ts";

const win = (moveCount: number, wonAt: number, cardCount = 104, suitCount = 1, elapsedMs: number | null = 600_000 + moveCount): SpiderWin =>
    ({cardCount, suitCount, moveCount, elapsedMs, wonAt});

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

    it("ranks by time the games whose time is known", () => {
        const slowFewMoves = win(100, 1, 104, 1, 900_000);
        const fastManyMoves = win(150, 2, 104, 1, 300_000);
        const untimed = win(90, 3, 104, 1, null);
        const wins = [slowFewMoves, fastManyMoves, untimed];

        expect(topWins(wins, {cardCount: 104, suitCount: 1}, "time")).toEqual([fastManyMoves, slowFewMoves]);
        expect(rankOf(wins, untimed, "time")).toBeNull();
        expect(rankOf(wins, untimed, "moves")).toBe(1);
    });

    it("keeps a game among the best by time even when it is not among the best by moves", () => {
        let wins: SpiderWin[] = [];
        for (let i = 0; i < TOP_SIZE; i++) wins = withWin(wins, win(100 + i, i, 104, 1, 900_000));
        const fast = win(300, 50, 104, 1, 60_000);

        expect(withWin(wins, fast)).toContainEqual(fast);
    });

    it("writes a time as minutes and seconds, with hours when needed", () => {
        expect(formatDuration(545_400)).toBe("9:05");
        expect(formatDuration(59_999)).toBe("0:59");
        expect(formatDuration(3_760_000)).toBe("1:02:40");
    });
});
