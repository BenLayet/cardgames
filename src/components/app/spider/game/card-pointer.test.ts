import {describe, expect, it} from "vitest";

import {isDragged, pressEnded, pressMoved, pressStarted} from "./card-pointer.ts";

// the first movable card of each column: 2 in column 0, 0 in column 1
const MOVABLE_RUN_STARTS = [2, 0];
const at = (x: number, y: number, pointerId = 1) => ({pointerId, x, y});

describe("card pointer", () => {
    it("clicks a card pressed and released without moving", () => {
        const press = pressStarted({column: 0, index: 2}, at(10, 10), MOVABLE_RUN_STARTS);
        expect(pressEnded(pressMoved(press, at(13, 12)), null)).toEqual({kind: "cardClicked", position: {column: 0, index: 2}});
    });

    it("clicks a column pressed where it holds no card", () => {
        const press = pressStarted({column: 1, index: null}, at(10, 10), MOVABLE_RUN_STARTS);
        expect(pressEnded(press, null)).toEqual({kind: "columnClicked", column: 1});
    });

    it("drops the cards dragged onto another column", () => {
        const press = pressMoved(pressStarted({column: 0, index: 2}, at(10, 10), MOVABLE_RUN_STARTS), at(60, 20));
        expect(press).toMatchObject({isDragging: true, dx: 50, dy: 10});
        expect(pressEnded(press, {column: 1, index: 0})).toEqual({kind: "cardsDropped", move: {from: {column: 0, index: 2}, to: 1}});
    });

    it("does nothing when the cards are dropped back on their column or outside the columns", () => {
        const press = pressMoved(pressStarted({column: 0, index: 2}, at(10, 10), MOVABLE_RUN_STARTS), at(60, 20));
        expect(pressEnded(press, {column: 0, index: 1})).toEqual({kind: "none"});
        expect(pressEnded(press, null)).toEqual({kind: "none"});
    });

    it("stays a drag when the pointer comes back near where it started", () => {
        const start = pressStarted({column: 0, index: 2}, at(10, 10), MOVABLE_RUN_STARTS);
        const back = pressMoved(pressMoved(start, at(60, 10)), at(11, 10));
        expect(back.isDragging).toBe(true);
    });

    it("does not drag a card covered by cards that cannot move with it, which stays a click", () => {
        const press = pressMoved(pressStarted({column: 0, index: 1}, at(10, 10), MOVABLE_RUN_STARTS), at(80, 80));
        expect(press.isDragging).toBe(false);
        expect(pressEnded(press, {column: 1, index: 0})).toEqual({kind: "cardClicked", position: {column: 0, index: 1}});
    });

    it("ignores the moves of another finger", () => {
        const press = pressStarted({column: 0, index: 2}, at(10, 10), MOVABLE_RUN_STARTS);
        expect(pressMoved(press, at(80, 80, 2))).toBe(press);
    });

    it("moves the dragged card and the ones above it", () => {
        const press = pressMoved(pressStarted({column: 0, index: 2}, at(10, 10), MOVABLE_RUN_STARTS), at(60, 20));
        expect([1, 2, 3].map(index => isDragged(press, 0, index))).toEqual([false, true, true]);
        expect(isDragged(press, 1, 3)).toBe(false);
        expect(isDragged(null, 0, 2)).toBe(false);
    });
});
