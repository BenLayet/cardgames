import {describe, expect, it} from "vitest";

import type {Card} from "./deck.model.ts";
import {SOLVABLE_DEAL_SEEDS} from "./spider-deals.ts";
import {
    canDealRow,
    canMoveCards,
    canPickCards,
    clickDestinationsOf,
    collectCompletedSequences,
    createSpiderDeck,
    dealRow,
    dealSeededTable,
    dealTable,
    destinationsOf,
    findHints,
    findMoves,
    EMPTY_TABLE,
    hasCompletedSequence,
    isSavedSpiderGame,
    isWon,
    movableRunStart,
    moveCards,
    pickSolvableSeed,
    type SpiderCard,
    sequenceCountOf,
    stockRowCount,
    SPIDER_VARIANTS,
    type Table,
    variantOf,
} from "./spider.model.ts";

// the columns of the game with 104 cards
const COLUMN_COUNT = 10;
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
        const deck = createSpiderDeck(suitCount, 104);
        expect(deck).toHaveLength(104);
        const suits: Record<string, number> = {};
        deck.forEach(card => {
            suits[card.charAt(1)] = (suits[card.charAt(1)] ?? 0) + 1;
        });
        expect(suits).toEqual(expectedSuits);
    });

    it("rejects other suit counts", () => {
        expect(() => createSpiderDeck(3, 104)).toThrow();
    });

    it("uses one deck of 52 cards, with fewer suits repeated more often", () => {
        const deck = createSpiderDeck(2, 52);
        expect(deck.filter(card => card.endsWith("S"))).toHaveLength(26);
        expect(deck.filter(card => card.endsWith("H"))).toHaveLength(26);
    });

    it("uses half a deck with one or two suits only", () => {
        const spades = "A23456789TJQK".split("").map(rank => `${rank}S`);
        expect(createSpiderDeck(1, 26)).toEqual([...spades, ...spades]);
        expect(createSpiderDeck(2, 26)).toEqual([...spades, ...spades.map(card => card.replace("S", "H"))]);
        expect(() => createSpiderDeck(4, 26)).toThrow();
    });

    it("rejects other card counts", () => {
        expect(() => createSpiderDeck(1, 32)).toThrow();
    });
});

describe("dealTable", () => {
    it("deals 54 cards into ten columns with only the top card face up, and keeps 50 in the stock", () => {
        const dealt = dealTable(createSpiderDeck(4, 104));
        expect(dealt.columns.map(column => column.length)).toEqual([6, 6, 6, 6, 5, 5, 5, 5, 5, 5]);
        dealt.columns.forEach(column => {
            expect(column.map(c => c.faceUp)).toEqual([...Array<boolean>(column.length - 1).fill(false), true]);
        });
        expect(dealt.stock).toHaveLength(50);
        expect(stockRowCount(dealt)).toBe(5);
        expect(new Set([...dealt.columns.flat(), ...dealt.stock].map(c => c.id)).size).toBe(104);
    });

    it("deals 28 of 52 cards into eight columns, and keeps 3 rows of 8 in the stock", () => {
        const dealt = dealTable(createSpiderDeck(4, 52));
        expect(dealt.columns.map(column => column.length)).toEqual([4, 4, 4, 4, 3, 3, 3, 3]);
        expect(dealt.stock).toHaveLength(24);
        expect(stockRowCount(dealt)).toBe(3);
        expect(dealRow(dealt).columns.map(column => column.length)).toEqual([5, 5, 5, 5, 4, 4, 4, 4]);
        expect(sequenceCountOf(dealt)).toBe(4);
        expect(variantOf(dealt)).toEqual({suitCount: 4, cardCount: 52});
    });
});

describe("dealTable with half a deck", () => {
    it("deals 14 of 26 cards into six columns, and keeps 2 rows of 6 in the stock", () => {
        const dealt = dealTable(createSpiderDeck(2, 26));
        expect(dealt.columns.map(column => column.length)).toEqual([3, 3, 2, 2, 2, 2]);
        expect(stockRowCount(dealt)).toBe(2);
        expect(sequenceCountOf(dealt)).toBe(2);
        expect(variantOf(dealt)).toEqual({suitCount: 2, cardCount: 26});
    });
});

describe("solvable deals", () => {
    it.each(SPIDER_VARIANTS)("knows deals with $cardCount cards and $suitCount suit(s), each one once", ({cardCount, suitCount}) => {
        const seeds = SOLVABLE_DEAL_SEEDS[cardCount]?.[suitCount] ?? [];
        expect(seeds.length).toBeGreaterThan(0);
        expect(new Set(seeds).size).toBe(seeds.length);
    });

    it("picks a seed from the list", () => {
        const seeds = SOLVABLE_DEAL_SEEDS[104]?.[4] ?? [];
        expect(pickSolvableSeed({cardCount: 104, suitCount: 4}, () => 0)).toBe(seeds[0]);
        expect(pickSolvableSeed({cardCount: 104, suitCount: 4}, () => 0.999999)).toBe(seeds[seeds.length - 1]);
    });

    // the lists of seeds were made with this shuffle: if the deal of a seed changes, they must be made again
    it("deals the same table from the same seed", () => {
        const deal = dealSeededTable({cardCount: 104, suitCount: 4}, 1);
        expect(deal).toEqual(dealSeededTable({cardCount: 104, suitCount: 4}, 1));
        expect(deal.columns.map(column => column[column.length - 1].card)).toEqual(["8H", "QD", "AS", "AC", "3C", "6D", "TD", "2C", "8D", "6S"]);
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

    it("wins with 52 cards once the four sequences are completed", () => {
        const t: Table = {columns: [fullSequence("S"), [], [], [], [], [], [], []], stock: [], completed: ["S", "S", "S"]};
        expect(isWon(t)).toBe(false);
        expect(isWon(collectCompletedSequences(t))).toBe(true);
    });

    it("wins once the eight sequences are completed", () => {
        const t = table(Array.from({length: 8}, (_, i) => fullSequence(i % 2 === 0 ? "S" : "H")));
        expect(isWon(t)).toBe(false);
        expect(isWon(collectCompletedSequences(t))).toBe(true);
    });
});

describe("destinations", () => {
    it("lists every column where the cards can go", () => {
        const t = table([cards("8S"), cards("9H"), cards("9D"), cards("TS")]);
        expect(destinationsOf(t, {column: 0, index: 0})).toEqual([1, 2, 4, 5, 6, 7, 8, 9]);
        expect(destinationsOf(t, {column: 3, index: 0})).toEqual([4, 5, 6, 7, 8, 9]);
    });
});

describe("click destinations", () => {
    it("keeps the columns ending with a card, and drops the empty ones", () => {
        const t = table([cards("8S"), cards("9H"), [], cards("9D")]);
        expect(clickDestinationsOf(t, {column: 0, index: 0})).toEqual([1, 3]);
    });

    it("keeps only the card of the same suit when a single one can take the cards", () => {
        const t = table([cards("8S"), cards("9H"), cards("9S"), [], cards("9D")]);
        expect(clickDestinationsOf(t, {column: 0, index: 0})).toEqual([2]);
    });

    it("offers every card when several of the same suit can take the cards", () => {
        const t = table([cards("8S"), cards("9S"), cards("9H"), cards("9S")]);
        expect(clickDestinationsOf(t, {column: 0, index: 0})).toEqual([1, 2, 3]);
    });

    it("keeps only the leftmost empty column when no card can take the cards", () => {
        const t = table([cards("_4D", "8S"), cards("KH")]);
        expect(clickDestinationsOf(t, {column: 0, index: 1})).toEqual([2]);
    });
});

describe("hints", () => {
    const full = (columns: SpiderCard[][]) => table([...columns, ...Array.from({length: COLUMN_COUNT - columns.length}, () => cards("KD"))]);

    it("prefers building a suit, then turning a card over", () => {
        const t = full([cards("_2C", "8S"), cards("9H"), cards("9S"), cards("4C", "3H")]);
        expect(findMoves(t)).toEqual([
            {from: {column: 0, index: 1}, to: 2},
            {from: {column: 0, index: 1}, to: 1},
        ]);
    });

    it("ignores moves that change nothing", () => {
        // 8S already lies on a 9 of its suit
        const t = full([cards("9S", "8S"), cards("9H")]);
        expect(findMoves(t)).toEqual([]);
    });

    it("suggests moving cards on a card of their suit away from another suit", () => {
        const t = full([cards("9H", "8S"), cards("9S")]);
        expect(findMoves(t)).toEqual([{from: {column: 0, index: 1}, to: 1}]);
    });

    it("does not suggest moving a whole column to an empty one", () => {
        const t = table([cards("8S")]);
        expect(findMoves(t)).toEqual([]);
    });

    it("suggests using an empty column in words only, after the moves onto a card", () => {
        const t = table([cards("_2C", "8S"), cards("9S"), cards("_3D", "4H"), cards()]);
        expect(findHints(t)).toEqual([
            {kind: "move", from: {column: 0, index: 1}},
            {kind: "emptyColumn"},
        ]);
    });

    it("suggests each card that can move once, whatever the number of its destinations", () => {
        const t = full([cards("_2C", "8S"), cards("9H"), cards("9S"), cards("_4C", "5D"), cards("6C")]);
        expect(findHints(t)).toEqual([
            {kind: "move", from: {column: 0, index: 1}},
            {kind: "move", from: {column: 3, index: 1}},
        ]);
    });

    it("suggests using an empty column when no move onto a card helps", () => {
        const t = table([cards("_2C", "8S"), cards()]);
        expect(findHints(t)).toEqual([{kind: "emptyColumn"}]);
    });

    it("suggests dealing a row when no move helps, and says when nothing is left", () => {
        const stock = cards(...Array.from({length: COLUMN_COUNT}, () => "_5C"));
        expect(findHints(table(Array.from({length: COLUMN_COUNT}, () => cards("KH")), stock))).toEqual([{kind: "deal"}]);
        expect(findHints(table(Array.from({length: COLUMN_COUNT}, () => cards("KH"))))).toEqual([{kind: "none"}]);
    });
});

describe("saved game", () => {
    it("accepts a game that was saved", () => {
        const dealt = dealTable(createSpiderDeck(2, 104));
        const saved = JSON.parse(JSON.stringify({table: dealt, history: [dealt], moveCount: 3})) as unknown;
        expect(isSavedSpiderGame(saved)).toBe(true);
    });

    it("accepts a game of 52 cards that was saved", () => {
        const dealt = dealTable(createSpiderDeck(1, 52));
        expect(isSavedSpiderGame({table: dealt, history: [], moveCount: 0})).toBe(true);
    });

    it.each([
        ["nothing", null],
        ["another shape", {columns: []}],
        ["52 cards in ten columns", {table: {...dealTable(createSpiderDeck(1, 52)), columns: [...dealTable(createSpiderDeck(1, 52)).columns, [], []]}, history: [], moveCount: 0}],
        ["missing cards", {table: {...dealTable(createSpiderDeck(1, 104)), stock: []}, history: [], moveCount: 0}],
        ["an unknown card", {table: {...EMPTY_TABLE, stock: cards("ZZ")}, history: [], moveCount: 0}],
    ])("rejects %s", (_, value) => {
        expect(isSavedSpiderGame(value)).toBe(false);
    });
});
