import {describe, expect, it} from "vitest";

import type {Card} from "./deck.model.ts";
import {
    canDealRow,
    canMoveCards,
    canPickCards,
    collectCompletedSequences,
    COLUMN_COUNT,
    createSpiderDeck,
    dealRow,
    dealTable,
    EMPTY_TABLE,
    hasCompletedSequence,
    isWon,
    movableRunStart,
    moveCards,
    type SpiderCard,
    stockRowCount,
    type Table,
} from "./spider.model.ts";

let nextId = 0;
// "5H" is face up, "_5H" face down
const cards = (...codes: string[]): SpiderCard[] => codes.map(code => ({
    id: nextId++,
    card: code.replace("_", "") as Card,
    faceUp: !code.startsWith("_"),
}));
const table = (columns: SpiderCard[][], stock: SpiderCard[] = []): Table => ({
    ...EMPTY_TABLE,
    columns: Array.from({length: COLUMN_COUNT}, (_, i) => columns[i] ?? []),
    stock,
});
const codes = (column: SpiderCard[]) => column.map(c => (c.faceUp ? "" : "_") + c.card);
const fullSequence = (suit: string) => cards(..."KQJT98765432A".split("").map(rank => rank + suit));

describe("createSpiderDeck", () => {
    it.each([
        [1, {S: 104}],
        [2, {S: 52, H: 52}],
        [4, {S: 26, H: 26, D: 26, C: 26}],
    ])("uses 104 cards of %i suit(s)", (suitCount, expectedSuits) => {
        const deck = createSpiderDeck(suitCount);
        expect(deck).toHaveLength(104);
        const suits: Record<string, number> = {};
        deck.forEach(card => {
            suits[card.charAt(1)] = (suits[card.charAt(1)] ?? 0) + 1;
        });
        expect(suits).toEqual(expectedSuits);
    });

    it("rejects other suit counts", () => {
        expect(() => createSpiderDeck(3)).toThrow();
    });
});

describe("dealTable", () => {
    it("deals 54 cards into ten columns with only the top card face up, and keeps 50 in the stock", () => {
        const dealt = dealTable(createSpiderDeck(4));
        expect(dealt.columns.map(column => column.length)).toEqual([6, 6, 6, 6, 5, 5, 5, 5, 5, 5]);
        dealt.columns.forEach(column => {
            expect(column.map(c => c.faceUp)).toEqual([...Array<boolean>(column.length - 1).fill(false), true]);
        });
        expect(dealt.stock).toHaveLength(50);
        expect(stockRowCount(dealt)).toBe(5);
        expect(new Set([...dealt.columns.flat(), ...dealt.stock].map(c => c.id)).size).toBe(104);
    });
});

describe("moving cards", () => {
    it("can move the run of face up cards of the same suit in descending order", () => {
        const column = cards("_KS", "9H", "8S", "7S", "6S");
        expect(movableRunStart(column)).toBe(2);
        const t = table([column]);
        expect(canPickCards(t, {column: 0, index: 2})).toBe(true);
        expect(canPickCards(t, {column: 0, index: 1})).toBe(false);
    });

    it("cannot move a face down card", () => {
        expect(movableRunStart(cards("_6S", "5S"))).toBe(1);
    });

    it("puts a run on a card one rank higher of any suit, and turns over the card left behind", () => {
        const t = table([cards("_KS", "8S", "7S"), cards("9H")]);
        expect(canMoveCards(t, {column: 0, index: 1}, 1)).toBe(true);

        const moved = moveCards(t, {column: 0, index: 1}, 1);

        expect(codes(moved.columns[0])).toEqual(["KS"]);
        expect(codes(moved.columns[1])).toEqual(["9H", "8S", "7S"]);
        // the given table is unchanged
        expect(codes(t.columns[0])).toEqual(["_KS", "8S", "7S"]);
    });

    it("puts any run on an empty column", () => {
        const t = table([cards("4D", "3D")]);
        expect(canMoveCards(t, {column: 0, index: 0}, 5)).toBe(true);
    });

    it("refuses a card that is not one rank lower", () => {
        const t = table([cards("7S"), cards("9H")]);
        expect(canMoveCards(t, {column: 0, index: 0}, 1)).toBe(false);
        expect(() => moveCards(t, {column: 0, index: 0}, 1)).toThrow();
    });

    it("refuses a move to the same column or to a column that does not exist", () => {
        const t = table([cards("7S")]);
        expect(canMoveCards(t, {column: 0, index: 0}, 0)).toBe(false);
        expect(canMoveCards(t, {column: 0, index: 0}, COLUMN_COUNT)).toBe(false);
        expect(canMoveCards(t, {column: 0, index: 1}, 1)).toBe(false);
    });

    it("plays the king as the highest card and the ace as the lowest", () => {
        expect(canMoveCards(table([cards("AS"), cards("2H")]), {column: 0, index: 0}, 1)).toBe(true);
        expect(canMoveCards(table([cards("KS"), cards("AH")]), {column: 0, index: 0}, 1)).toBe(false);
    });
});

describe("dealing a row", () => {
    const stock = cards("_AS", "_2S", "_3S", "_4S", "_5S", "_6S", "_7S", "_8S", "_9S", "_TS");

    it("puts a face up card on each column", () => {
        const t = table(Array.from({length: COLUMN_COUNT}, () => cards("KH")), stock);
        expect(canDealRow(t)).toBe(true);

        const dealt = dealRow(t);

        expect(dealt.stock).toHaveLength(0);
        expect(dealt.columns.every(column => column.length === 2 && column[1].faceUp)).toBe(true);
        // the top card of the stock goes to the first column
        expect(dealt.columns[0][1].id).toBe(stock[stock.length - 1].id);
    });

    it("needs a card on every column and a card in the stock", () => {
        expect(canDealRow(table([cards("KH")], stock))).toBe(false);
        expect(canDealRow(table(Array.from({length: COLUMN_COUNT}, () => cards("KH"))))).toBe(false);
    });
});

describe("completed sequences", () => {
    it("removes a run from the king to the ace of the same suit and turns over the card left behind", () => {
        const t = table([[...cards("_5D"), ...fullSequence("S")], cards("3H")]);
        expect(hasCompletedSequence(t)).toBe(true);

        const collected = collectCompletedSequences(t);

        expect(codes(collected.columns[0])).toEqual(["5D"]);
        expect(collected.completed).toEqual(["S"]);
        expect(hasCompletedSequence(collected)).toBe(false);
    });

    it("does not count a run of mixed suits", () => {
        const mixed = cards(..."KQJT98765432A".split("").map((rank, i) => rank + (i === 5 ? "H" : "S")));
        expect(hasCompletedSequence(table([mixed]))).toBe(false);
    });

    it("wins once the eight sequences are completed", () => {
        const t = table(Array.from({length: 8}, (_, i) => fullSequence(i % 2 === 0 ? "S" : "H")));
        expect(isWon(t)).toBe(false);
        expect(isWon(collectCompletedSequences(t))).toBe(true);
    });
});
