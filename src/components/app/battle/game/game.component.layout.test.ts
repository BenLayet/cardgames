import {describe, expect, it} from "vitest";

import {nearestSeat, playerKeys, tableLayout, TILT_DEG} from "./game.component.layout.ts";

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
        // two players lay their cards side by side, also on an upright phone
        expect(tableLayout(2, 390, 760).rows).toBe(1);
    });

    it("makes the cards smaller when more players need room", () => {
        expect(tableLayout(6, 390, 760).cardWidth).toBeLessThan(tableLayout(2, 390, 760).cardWidth);
        // two players sit in the corners, closer to the middle: compared with three
        expect(tableLayout(6, 1280, 680).cardWidth).toBeLessThan(tableLayout(3, 1280, 680).cardWidth);
    });

    it("gives a tap to the human whose pile is the nearest", () => {
        const layout = tableLayout(4, 390, 760);
        expect(nearestSeat(layout, [0, 1, 2, 3], {x: 195, y: 700})).toBe(0);
        expect(nearestSeat(layout, [0, 1, 2, 3], {x: 10, y: 380})).toBe(1);
        // the pile of a player who is out takes no tap
        expect(nearestSeat(layout, [0, 2, 3], {x: 10, y: 380})).not.toBe(1);
        expect(nearestSeat(layout, [], {x: 10, y: 380})).toBe(null);
    });
    it("draws no slot for a player out of the game, and centres the others again, as large or larger", () => {
        const all = tableLayout(4, 390, 760);
        const three = tableLayout(4, 390, 760, [0, 2, 3]);
        expect(three.seats.map(seat => seat.hasSlot)).toEqual([true, false, true, true]);
        // the piles stay where they are
        expect(three.seats[1].pile).toEqual(three.seats[1].played);
        expect(three.cardWidth).toBeGreaterThanOrEqual(all.cardWidth);
        // the remaining slots are centred on the table
        const slots = three.seats.filter(seat => seat.hasSlot).map(seat => seat.played);
        const xs = slots.map(slot => slot.x), ys = slots.map(slot => slot.y);
        expect((Math.min(...xs) + Math.max(...xs)) / 2).toBeCloseTo(390 / 2, 0);
        expect((Math.min(...ys) + Math.max(...ys)) / 2).toBeCloseTo(760 / 2, 0);
        expect(all.seats.every(seat => seat.hasSlot)).toBe(true);
    });

    it("keeps a single slot, centred, for the last player", () => {
        const layout = tableLayout(6, 844, 300, [4]);
        expect(layout.seats.filter(seat => seat.hasSlot)).toHaveLength(1);
        expect(layout.seats[4].played).toEqual({x: 422, y: 150});
    });
});

describe("message of a battle", () => {
    it.each(sizes)("is written above the slots, clear of the piles and their names, on %i x %i", (width, height) => {
        for (const players of [2, 3, 4, 5, 6]) {
            const {cardWidth, cardHeight, seats, message} = tableLayout(players, width, height);
            const slotsTop = Math.min(...seats.map(seat => seat.played.y)) - cardHeight / 2;
            expect(message.bottom, `${players} players`).toBeLessThan(slotsTop);
            // the longest message, "Double bataille !", is about 8.5 letters wide
            const box = {left: message.x - message.fontSize * 4.25, right: message.x + message.fontSize * 4.25, top: message.bottom - message.fontSize * 1.15};
            expect(box.top, `${players} players`).toBeGreaterThanOrEqual(0);
            seats.forEach(({pile}) => {
                const apart = pile.x + cardWidth / 2 <= box.left || pile.x - cardWidth / 2 >= box.right
                    || pile.y + cardHeight / 2 <= box.top || pile.y - cardHeight / 2 >= message.bottom;
                expect(apart, `${players} players`).toBe(true);
            });
        }
    });
});

describe("keys of the players", () => {
    it("gives each of two players the key on the side of their pile, and L, A, G, P, X, M from three players", () => {
        expect(playerKeys(2)).toEqual(["a", "l"]);
        expect(playerKeys(3)).toEqual(["l", "a", "g", "p", "x", "m"]);
        expect(playerKeys(6)).toEqual(["l", "a", "g", "p", "x", "m"]);
    });
});

describe("tilted cards in the middle", () => {
    it.each(sizes)("never overlap the card of the next slot, on %i x %i", (width, height) => {
        for (const players of [2, 3, 4, 5, 6]) {
            const layout = tableLayout(players, width, height);
            const angle = TILT_DEG * Math.PI / 180;
            // the half size of a card tilted by the largest angle; a stack of cards played rises by 8 px and shifts right by 4 px
            const halfWidth = layout.cardWidth / 2 * Math.cos(angle) + layout.cardHeight / 2 * Math.sin(angle);
            const halfHeight = layout.cardHeight / 2 * Math.cos(angle) + layout.cardWidth / 2 * Math.sin(angle);
            const slots = layout.seats.map(seat => seat.played);
            slots.forEach((a, i) => slots.slice(i + 1).forEach(b => {
                const apart = Math.abs(a.x - b.x) >= 2 * halfWidth + 4 || Math.abs(a.y - b.y) >= 2 * halfHeight + 8;
                expect(apart, `${players} players`).toBe(true);
            }));
        }
    });
});
