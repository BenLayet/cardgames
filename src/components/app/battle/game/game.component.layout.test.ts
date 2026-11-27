import {describe, expect, it} from "vitest";

import {landingPoint, nearestSeat, playerKeys, tableLayout, TILT_DEG} from "./game.component.layout.ts";

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
        "lays the %i slots of a %ix%i table side by side, each one near its pile, clear of the piles",
        (count, width, height) => {
            const {cardWidth, cardHeight, rows, seats} = tableLayout(count, width, height);
            expect(rows).toBeGreaterThanOrEqual(1);
            expect(rows).toBeLessThanOrEqual(3);
            const slots = seats.map(seat => seat.played);
            // no two slots overlap
            slots.forEach((a, i) => slots.slice(i + 1).forEach(b =>
                expect(Math.abs(a.x - b.x) >= cardWidth || Math.abs(a.y - b.y) >= cardHeight).toBe(true)));
            // each player has the slot nearest to their pile: swapping the slots of two players never brings them nearer
            const distance = (seat: number, slot: number) => Math.hypot(seats[seat].pile.x - slots[slot].x, seats[seat].pile.y - slots[slot].y);
            slots.forEach((_, a) => slots.forEach((_, b) =>
                expect(distance(a, b) + distance(b, a)).toBeGreaterThanOrEqual(distance(a, a) + distance(b, b) - 1e-6)));
            // no slot on a pile
            seats.forEach(({pile}) => slots.forEach(slot =>
                expect(Math.abs(pile.x - slot.x) >= cardWidth || Math.abs(pile.y - slot.y) >= cardHeight).toBe(true)));
        });

    it("gives each player the slot on the side of their pile", () => {
        // three players on an upright phone: the slot of the player at the bottom is the lowest one
        const three = tableLayout(3, 390, 760).seats;
        expect(three[0].played.y).toBe(Math.max(...three.map(seat => seat.played.y)));
        expect(three[1].played.x).toBeLessThan(three[2].played.x);
        // six players on a wide phone, on one row: the player on the left has the first slot, the one on the right the last
        const wide = tableLayout(6, 844, 300);
        expect(wide.rows).toBe(1);
        const six = wide.seats;
        const xs = six.map(seat => seat.played.x);
        expect(six[1].played.x).toBe(Math.min(...xs));
        expect(six[4].played.x).toBe(Math.max(...xs));
        // the players of the left half have the slots of the left half
        [0, 1, 2].forEach(seat => expect(six[seat].played.x).toBeLessThan(422));
        [3, 4, 5].forEach(seat => expect(six[seat].played.x).toBeGreaterThan(422));
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
        // each remaining player keeps the slot nearest to their pile
        const left = three.seats[0].played, right = three.seats[3].played;
        expect(three.seats[2].played.y).toBeLessThan(Math.max(left.y, right.y));
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

    it.each(sizes.flatMap(([width, height]) => [2, 3, 4, 5, 6].map(count => [count, width, height])))(
        "lands the cards won by each of the %i players of a %ix%i table against their pile, on the side of the centre",
        (count, width, height) => {
            const layout = tableLayout(count, width, height);
            const centre = {x: width / 2, y: height / 2};
            layout.seats.forEach(({pile}, seat) => {
                const landing = landingPoint(layout, seat, centre);
                // half over the pile: the card covers part of it, and is not lost under it
                const distance = Math.hypot(landing.x - pile.x, landing.y - pile.y);
                expect(distance).toBeGreaterThan(0);
                expect(distance).toBeLessThan(layout.cardHeight);
                // closer to the centre of the table than the pile
                expect(Math.hypot(landing.x - centre.x, landing.y - centre.y)).toBeLessThan(Math.hypot(pile.x - centre.x, pile.y - centre.y));
            });
        });
});
