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

    it.each(sizes.flatMap(([width, height]) => [2, 3, 4, 5, 6].map(count => [count, width, height])))(
        "lays the %i slots of a %ix%i table side by side, in seat order, clear of the piles",
        (count, width, height) => {
            const {cardWidth, cardHeight, rows, seats} = tableLayout(count, width, height);
            expect(rows).toBeGreaterThanOrEqual(1);
            expect(rows).toBeLessThanOrEqual(3);
            const slots = seats.map(seat => seat.played);
            // no two slots overlap
            slots.forEach((a, i) => slots.slice(i + 1).forEach(b =>
                expect(Math.abs(a.x - b.x) >= cardWidth || Math.abs(a.y - b.y) >= cardHeight).toBe(true)));
            // in seat order: left to right, row after row
            slots.slice(1).forEach((slot, i) => expect(slot.y > slots[i].y || (slot.y === slots[i].y && slot.x > slots[i].x)).toBe(true));
            // no slot on a pile
            seats.forEach(({pile}) => slots.forEach(slot =>
                expect(Math.abs(pile.x - slot.x) >= cardWidth || Math.abs(pile.y - slot.y) >= cardHeight).toBe(true)));
        });

    it("takes the number of rows that gives the largest cards", () => {
        // six players on an upright phone: more than one row
        expect(tableLayout(6, 390, 760).rows).toBeGreaterThan(1);
        expect(tableLayout(2, 1280, 680).rows).toBe(1);
    });

    it("makes the cards smaller when more players need room", () => {
        expect(tableLayout(6, 390, 760).cardWidth).toBeLessThan(tableLayout(2, 390, 760).cardWidth);
        expect(tableLayout(6, 1280, 680).cardWidth).toBeLessThan(tableLayout(2, 1280, 680).cardWidth);
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
