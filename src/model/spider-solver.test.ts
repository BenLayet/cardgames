import {describe, expect, it} from "vitest";

import {dealSeededTable} from "./spider.model.ts";
import {findSolution, replaySolution, solveTable} from "./spider-solver.ts";
import {SOLVABLE_DEAL_SEEDS} from "./spider-deals.ts";

describe("spider solver", () => {
    const seed = (SOLVABLE_DEAL_SEEDS[104]?.[1] ?? [])[0];
    const table = dealSeededTable({cardCount: 104, suitCount: 1}, seed);

    it("wins a listed deal with one suit, and the rules of the game accept the solution", () => {
        const solution = findSolution(table);
        expect(solution).not.toBeNull();
        expect(replaySolution(table, solution ?? [])).toBe(true);
    }, 60000);

    it("gives the same solution each time", () => {
        const budget = {nodesPerDeal: 2000, beamWidth: 5};
        expect(solveTable(table, budget)).toEqual(solveTable(table, budget));
    }, 60000);

    it("rejects a solution that does not win or breaks the rules", () => {
        expect(replaySolution(table, [])).toBe(false);
        expect(replaySolution(table, [{kind: "move", move: {from: {column: 0, index: 0}, to: 1}}])).toBe(false);
    });
});
