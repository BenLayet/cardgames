import {describe, expect, it} from "vitest";

import {CARD_RATIO, isCompactWidth} from "./card-size.ts";

describe("card size", () => {
    it("draws a card narrower than 60 px compact", () => {
        expect(isCompactWidth(59)).toBe(true);
        expect(isCompactWidth(60)).toBe(false);
    });

    it("has the ratio of the card faces", () => {
        expect(CARD_RATIO).toBeCloseTo(1.3986, 4);
    });
});
