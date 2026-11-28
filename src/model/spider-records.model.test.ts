import {describe, expect, it} from "vitest";

import {bestRankOf, formatDuration, rankOf, type SpiderWin, TOP_SIZE, topWins, withWin} from "./spider-records.model.ts";

const win = (moveCount: number, wonAt: number, cardCount = 104, suitCount = 1, elapsedMs: number | null = 600_000 + moveCount): SpiderWin =>
    ({cardCount, suitCount, moveCount, elapsedMs, wonAt});

describe("spider records", () => {
    it("ranks the games of a kind from the fewest moves, the first made first between equal games", () => {
        const wins = [win(150, 1), win(120, 2), win(150, 0), win(90, 3, 52)];

        expect(topWins(wins, {cardCount: 104, suitCount: 1})).toEqual([win(120, 2), win(150, 0), win(150, 1)]);
        expect(rankOf(wins, win(150, 1))).toBe(3);
        expect(rankOf(wins, win(90, 3, 52))).toBe(1);
    });

    it("keeps only the best games of each kind, once they are older than a month", () => {
        const later = 365 * 24 * 60 * 60 * 1000;
        let wins: SpiderWin[] = [];
        for (let i = 0; i < TOP_SIZE; i++) wins = withWin(wins, win(100 + i, i));
        wins = withWin(wins, win(50, 20, 52));

        const better = withWin(wins, win(99, later));
        expect(rankOf(better, win(99, later))).toBe(1);
        expect(better).not.toContainEqual(win(109, 9));
        expect(better).toContainEqual(win(50, 20, 52));
        expect(better).toHaveLength(TOP_SIZE + 1);
    });

    it("ranks by time the games whose time is known", () => {
        const slowFewMoves = win(100, 1, 104, 1, 900_000);
        const fastManyMoves = win(150, 2, 104, 1, 300_000);
        const untimed = win(90, 3, 104, 1, null);
        const wins = [slowFewMoves, fastManyMoves, untimed];

        expect(topWins(wins, {cardCount: 104, suitCount: 1}, {measure: "time"})).toEqual([fastManyMoves, slowFewMoves]);
        expect(rankOf(wins, untimed, {measure: "time"})).toBeNull();
        expect(rankOf(wins, untimed, {measure: "moves"})).toBe(1);
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

    describe("periods", () => {
        const DAY = 24 * 60 * 60 * 1000;
        const now = 100 * DAY;
        const daysAgo = (moveCount: number, days: number) => win(moveCount, now - days * DAY);

        it("ranks over the last 30 or 7 days", () => {
            const wins = [daysAgo(100, 60), daysAgo(120, 20), daysAgo(130, 3)];

            expect(topWins(wins, wins[0], {period: "month", now})).toEqual([daysAgo(120, 20), daysAgo(130, 3)]);
            expect(topWins(wins, wins[0], {period: "week", now})).toEqual([daysAgo(130, 3)]);
            expect(topWins(wins, wins[0], {now})).toHaveLength(3);
        });

        it("tells the rank of a new win over the most important period where it has one", () => {
            const old = Array.from({length: TOP_SIZE}, (_, i) => daysAgo(100 + 2 * i, 60));
            const lastMonth = Array.from({length: TOP_SIZE}, (_, i) => daysAgo(150 + i, 20));
            const rank = (moveCount: number) => bestRankOf([...old, ...lastMonth, win(moveCount, now)], win(moveCount, now), "moves");

            expect(rank(105)).toEqual({rank: 4, period: "all"});
            expect(rank(152)).toEqual({rank: 4, period: "month"});
            expect(rank(170)).toEqual({rank: 1, period: "week"});
        });

        it("keeps every win of the last 30 days, and the older ones only among the best of all time", () => {
            const old = Array.from({length: TOP_SIZE}, (_, i) => daysAgo(100 + i, 40));
            const wins = withWin(old, win(300, now));
            expect(wins).toEqual([...old, win(300, now)]);

            const later = withWin(wins, win(301, now + 40 * DAY));
            expect(later).not.toContainEqual(win(300, now));
            expect(later).toContainEqual(win(301, now + 40 * DAY));
            expect(later).toContainEqual(daysAgo(109, 40));
        });
    });
});
