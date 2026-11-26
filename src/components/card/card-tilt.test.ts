import {describe, expect, it} from "vitest";

import {cardTilt} from "./card-tilt.ts";
import {DECK} from "../../model/deck.model.ts";

describe("tilt of a card on the table", () => {
    const tilts = DECK.map(card => cardTilt(card, "seat0Played", 12));

    it("stays within half the messy level on each side", () => {
        expect(Math.max(...tilts.map(Math.abs))).toBeLessThanOrEqual(6);
    });

    it("differs from card to card and reaches nearly the largest angle", () => {
        expect(new Set(tilts.map(tilt => tilt.toFixed(2))).size).toBeGreaterThan(45);
        expect(Math.max(...tilts)).toBeGreaterThan(5);
        expect(Math.min(...tilts)).toBeLessThan(-5);
        // the first card of a stack is no longer always straight
        expect(tilts.filter(tilt => Math.abs(tilt) < 0.1).length).toBeLessThan(3);
    });

    it("is the same for the same card on the same stack", () => {
        expect(cardTilt("KS", "seat1Pile", 6)).toBe(cardTilt("KS", "seat1Pile", 6));
    });
});
