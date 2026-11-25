import {describe, expect, it} from "vitest";

import {cardOffsets} from "./game.component.layout.ts";
import type {Card} from "../../../../model/deck.model.ts";
import {type SpiderCard, spiderLayout} from "../../../../model/spider.model.ts";

const RANKS = spiderLayout(104).ranks;

let nextId = 0;
// "5H" is face up, "_5H" face down
const cards = (...codes: string[]): SpiderCard[] => codes.map(code => ({
    id: nextId++,
    card: code.replace("_", "") as Card,
    faceUp: !code.startsWith("_"),
}));
const gaps = (offsets: number[]) => offsets.slice(1).map((offset, i) => +(offset - offsets[i]).toFixed(3));

describe("card offsets", () => {
    it("shows more of the face up cards than of the face down ones", () => {
        expect(gaps(cardOffsets(cards("_KS", "_QS", "9H", "4D"), 10, false, RANKS))).toEqual([0.12, 0.12, 0.28]);
    });

    it("shows a little more of a compact card", () => {
        expect(gaps(cardOffsets(cards("9H", "4D"), 10, true, RANKS))).toEqual([0.32]);
    });

    it("squeezes the face down cards first when the column is too tall", () => {
        const offsets = cardOffsets(cards("_KS", "_QS", "_JS", "9H", "4D"), 0.5, false, RANKS);
        expect(offsets[offsets.length - 1]).toBeCloseTo(0.5);
        expect(gaps(offsets)).toEqual([0.073, 0.073, 0.073, 0.28]);
    });

    it("then squeezes the cards inside a sequence, keeping the first and last ones readable", () => {
        const offsets = cardOffsets(cards("_KD", "KS", "QS", "JS", "TS", "4H"), 1, false, RANKS);
        expect(offsets[offsets.length - 1]).toBeCloseTo(1);
        const [faceDown, king, queen, jack, ten] = gaps(offsets);
        expect(faceDown).toBe(0.04);
        expect(king).toBe(0.28);
        expect(ten).toBe(0.28);
        expect(queen).toBe(jack);
        expect(queen).toBeLessThan(0.28);
    });

    it("squeezes every card alike as a last resort", () => {
        const offsets = cardOffsets(cards("9H", "4D", "2C"), 0.28, false, RANKS);
        expect(gaps(offsets)).toEqual([0.14, 0.14]);
    });

    it("lays out an empty column", () => {
        expect(cardOffsets([], 3, false, RANKS)).toEqual([]);
    });
});
