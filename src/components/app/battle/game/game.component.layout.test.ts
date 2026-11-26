import {describe, expect, it} from "vitest";

import {nearestSeat, tableLayout} from "./game.component.layout.ts";

const sizes = [[390, 760], [844, 300], [1280, 680]] as const;

describe("Bataille table layout", () => {
    it.each(sizes.flatMap(([width, height]) => [2, 3, 4, 5, 6].map(count => [count, width, height])))(
        "keeps the %i piles of a %ix%i table on the table, the first one at the bottom",
        (count, width, height) => {
            const layout = tableLayout(count, width, height);
            expect(layout.seats).toHaveLength(count);
            layout.seats.forEach(({pile}) => {
                expect(pile.x - layout.cardWidth / 2).toBeGreaterThanOrEqual(0);
                expect(pile.x + layout.cardWidth / 2).toBeLessThanOrEqual(width);
                expect(pile.y - layout.cardHeight / 2).toBeGreaterThanOrEqual(0);
                expect(pile.y + layout.cardHeight / 2).toBeLessThanOrEqual(height);
            });
            expect(layout.seats[0].pile.y).toBe(Math.max(...layout.seats.map(seat => seat.pile.y)));
        });

    it("lays the cards played between the pile and the centre of the table", () => {
        const {seats: [bottom, left, top]} = tableLayout(4, 390, 760);
        expect(bottom.played.y).toBeLessThan(bottom.pile.y);
        expect(bottom.played.y).toBeGreaterThan(380);
        expect(top.played.y).toBeGreaterThan(top.pile.y);
        expect(top.played.y).toBeLessThan(380);
        expect(left.played.x).toBeGreaterThan(left.pile.x);
    });

    it.each(sizes)("puts two players in opposite corners, their cards side by side in the middle of a %ix%i table", (width, height) => {
        const {cardWidth, cardHeight, seats: [first, second]} = tableLayout(2, width, height);
        // player 1 at the bottom left, player 2 at the top right
        expect(first.pile.x).toBeLessThan(width / 2);
        expect(first.pile.y).toBeGreaterThan(height / 2);
        expect(second.pile.x).toBeGreaterThan(width / 2);
        expect(second.pile.y).toBeLessThan(height / 2);
        // the cards played on the same line, player 1's on the left, not over each other
        expect(first.played.y).toBe(second.played.y);
        expect(second.played.x - first.played.x).toBeGreaterThanOrEqual(cardWidth);
        // the cards of a battle are spread away from the other player's
        const isWide = width > height;
        expect(first.fan.x).toBeLessThanOrEqual(0);
        expect(second.fan.x).toBeGreaterThanOrEqual(0);
        if (isWide) expect(-first.fan.x).toBeGreaterThan(cardWidth / 5);
        else expect(first.fan.y).toBeGreaterThan(cardHeight / 6);
    });

    it("makes the cards smaller for more players", () => {
        expect(tableLayout(3, 390, 760).cardWidth).toBeLessThan(tableLayout(2, 390, 760).cardWidth);
        expect(tableLayout(5, 390, 760).cardWidth).toBeLessThan(tableLayout(4, 390, 760).cardWidth);
    });

    it("gives a tap to the human whose pile is the nearest", () => {
        const layout = tableLayout(4, 390, 760);
        expect(nearestSeat(layout, [0, 1, 2, 3], {x: 195, y: 700})).toBe(0);
        expect(nearestSeat(layout, [0, 1, 2, 3], {x: 10, y: 380})).toBe(1);
        // the pile of a player who is out takes no tap
        expect(nearestSeat(layout, [0, 2, 3], {x: 10, y: 380})).not.toBe(1);
        expect(nearestSeat(layout, [], {x: 10, y: 380})).toBe(null);
    });
});
