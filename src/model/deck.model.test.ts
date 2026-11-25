import {describe, expect, it} from "vitest";
import {cardValue, createDeck, isFirstCardHigherValue, seededRandom, shuffleDeck} from "./deck.model.ts";

describe("createDeck", () => {
    it("creates a full deck of 52 distinct cards", () => {
        const deck = createDeck(52);
        expect(deck).toHaveLength(52);
        expect(new Set(deck).size).toBe(52);
    });

    it("keeps the highest ranks of each suit for a smaller deck", () => {
        expect(createDeck(12)).toEqual(["QS", "KS", "AS", "QH", "KH", "AH", "QD", "KD", "AD", "QC", "KC", "AC"]);
    });

    it.each([10, 56, 0])("rejects %i cards", (cardCount) => {
        expect(() => createDeck(cardCount)).toThrow();
    });
});

describe("card values", () => {
    it("orders cards by rank, ace being the highest", () => {
        expect(cardValue("AS")).toBeGreaterThan(cardValue("KH"));
        expect(cardValue("TS")).toBeGreaterThan(cardValue("9H"));
        expect(cardValue("2S")).toBe(0);
    });

    it("ignores the suit", () => {
        expect(cardValue("7S")).toBe(cardValue("7D"));
        expect(isFirstCardHigherValue("7S", "7D")).toBe(false);
    });

    it("is never higher when a card is missing", () => {
        expect(isFirstCardHigherValue("AS", undefined)).toBe(false);
        expect(isFirstCardHigherValue(undefined, "2S")).toBe(false);
    });
});

describe("shuffleDeck", () => {
    it("keeps the same cards without changing the given deck", () => {
        const deck = createDeck(52);
        const copy = [...deck];
        const shuffled = shuffleDeck(deck);
        expect(deck).toEqual(copy);
        expect([...shuffled].sort()).toEqual([...deck].sort());
    });

    it("gives the same order for the same seed", () => {
        const deck = createDeck(52);
        expect(shuffleDeck(deck, seededRandom(42))).toEqual(shuffleDeck(deck, seededRandom(42)));
        expect(shuffleDeck(deck, seededRandom(42))).not.toEqual(shuffleDeck(deck, seededRandom(43)));
    });
});

describe("seededRandom", () => {
    it("gives numbers from 0 to 1, the same ones for the same seed", () => {
        const first = seededRandom(7);
        const second = seededRandom(7);
        const numbers = Array.from({length: 1000}, () => first());
        expect(numbers.every(n => n >= 0 && n < 1)).toBe(true);
        expect(Array.from({length: 1000}, () => second())).toEqual(numbers);
    });
});
