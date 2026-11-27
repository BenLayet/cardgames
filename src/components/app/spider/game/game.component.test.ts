import {beforeEach, describe, expect, it} from "vitest";
import {initTestStore, type TestStore} from "@softer-components/test-utilities";
import type {ExtractEventNameUnion, ExtractPayload} from "@softer-components/types";

import {gameDef, type GameContract} from "./game.component.ts";
import type {Card} from "../../../../model/deck.model.ts";
import type {SpiderCard, Table} from "../../../../model/spider.model.ts";
import {fakeAudioService, fakeSpiderSaveService} from "../../../../test/fakes.ts";

// the columns of the game with 104 cards
const COLUMN_COUNT = 10;
// the choices of the games dealt by the tests
const ONE_SUIT = {suitCount: 1, cardCount: 104};

const event = <N extends ExtractEventNameUnion<GameContract>>(name: N, payload?: ExtractPayload<GameContract, N>) =>
    ({name, payload, statePath: []});

let audioService: ReturnType<typeof fakeAudioService>;
let spiderSaveService: ReturnType<typeof fakeSpiderSaveService>;
let store: TestStore<GameContract>;

beforeEach(() => {
    audioService = fakeAudioService();
    spiderSaveService = fakeSpiderSaveService();
    store = initTestStore(gameDef({audioService, spiderSaveService}));
});

const values = () => store.getValues("");
const column = (index: number) => values().columns()[index].map(c => (c.faceUp ? "" : "_") + c.card);

let nextId = 0;
// "5H" is face up, "_5H" face down
const cards = (...codes: string[]): SpiderCard[] => codes.map(code => ({
    id: nextId++,
    card: code.replace("_", "") as Card,
    faceUp: !code.startsWith("_"),
}));
// the columns left empty, after the two first ones
const NO_OTHER_CARDS: SpiderCard[][] = Array.from({length: COLUMN_COUNT - 2}, () => []);
const SEQUENCE_WITHOUT_ACE = "KQJT98765432".split("").map(rank => `${rank}S`);
// the given columns, the other ones hold a king so that a row can be dealt
const deal = (columns: SpiderCard[][], {stock = [] as SpiderCard[], completed = [] as Table["completed"]} = {}) =>
    store.when(event("dealCompleted", {
        columns: Array.from({length: COLUMN_COUNT}, (_, i) => columns[i] ?? cards("KD")),
        stock,
        completed,
    }));

describe("spider game", () => {
    it("deals 104 cards of the chosen suits", async () => {
        await store.when(event("dealRequested", {suitCount: 2, cardCount: 104}));

        const dealt = [...values().columns().flat(), ...values().table().stock];
        expect(dealt).toHaveLength(104);
        expect(new Set(dealt.map(c => c.card.charAt(1)))).toEqual(new Set(["S", "H"]));
        expect(values().stockRowCount()).toBe(5);
    });

    it("moves the cards dropped on a column that accepts them", async () => {
        await deal([cards("_4D", "8S", "7S"), cards("9H")]);

        await store.when(event("cardsDropped", {from: {column: 0, index: 1}, to: 1}));

        expect(column(0)).toEqual(["4D"]);
        expect(column(1)).toEqual(["9H", "8S", "7S"]);
        expect(values().moveCount()).toBe(1);
        expect(audioService.playCardSlide).toHaveBeenCalled();
    });

    it("ignores a drop on a column that does not accept the cards", async () => {
        await deal([cards("7S"), cards("9H")]);

        await store.when(event("cardsDropped", {from: {column: 0, index: 0}, to: 1}));

        expect(column(0)).toEqual(["7S"]);
        expect(values().moveCount()).toBe(0);
    });

    it("moves a clicked card right away when it can only go to one column", async () => {
        await deal([cards("_4D", "8S"), cards("9H")]);

        await store.when(event("cardClicked", {column: 0, index: 1}));

        expect(column(1)).toEqual(["9H", "8S"]);
        expect(column(0)).toEqual(["4D"]);
        expect(values().selected()).toBeNull();
    });

    it("moves a clicked card right away onto the only card of its suit that can take it", async () => {
        await deal([cards("8S"), cards("9H"), cards("9S")]);

        await store.when(event("cardClicked", {column: 0, index: 0}));

        expect(column(2)).toEqual(["9S", "8S"]);
        expect(values().selected()).toBeNull();
    });

    it("shows the columns where a clicked card can go, and moves it to the one clicked next", async () => {
        await deal([cards("8S"), cards("9H"), cards("9D")]);

        await store.when(event("cardClicked", {column: 0, index: 0}));
        expect(values().selected()).toEqual({column: 0, index: 0});
        expect(values().destinations()).toEqual([1, 2]);

        await store.when(event("cardClicked", {column: 2, index: 0}));
        expect(column(2)).toEqual(["9D", "8S"]);
        expect(values().destinations()).toEqual([]);
    });

    it("offers every column where the selected card can go, the empty ones too, and moves it to a clicked empty column", async () => {
        await deal([cards("8S"), cards("9H"), [], cards("9D")]);

        await store.when(event("cardClicked", {column: 0, index: 0}));
        expect(values().destinations()).toEqual([1, 2, 3]);

        await store.when(event("columnClicked", 2));
        expect(column(2)).toEqual(["8S"]);
        expect(values().selected()).toBeNull();
    });

    it("moves a clicked card to the leftmost empty column when only empty columns can take it", async () => {
        await deal([cards("_4D", "8S"), [], []]);

        await store.when(event("cardClicked", {column: 0, index: 1}));

        expect(column(1)).toEqual(["8S"]);
        expect(column(2)).toEqual([]);
    });

    it("still moves dropped cards to any empty column", async () => {
        await deal([cards("8S"), cards("9H"), [], []]);

        await store.when(event("cardsDropped", {from: {column: 0, index: 0}, to: 3}));

        expect(column(3)).toEqual(["8S"]);
    });

    it("unselects on a click elsewhere or on the same card again", async () => {
        await deal([cards("8S"), cards("9H"), cards("9D"), cards("JC")]);

        await store.when(event("cardClicked", {column: 0, index: 0}));
        await store.when(event("columnClicked", 3));
        expect(values().selected()).toBeNull();
        expect(column(3)).toEqual(["JC"]);

        await store.when(event("cardClicked", {column: 0, index: 0}));
        await store.when(event("cardClicked", {column: 0, index: 0}));
        expect(values().selected()).toBeNull();
    });

    it("selects another card clicked while cards are selected", async () => {
        await deal([cards("8S"), cards("9H"), cards("9D"), cards("8C")]);

        await store.when(event("cardClicked", {column: 0, index: 0}));
        await store.when(event("cardClicked", {column: 3, index: 0}));

        expect(values().selected()).toEqual({column: 3, index: 0});
    });

    it("does nothing when a card that cannot be moved is clicked", async () => {
        await deal([cards("_KS", "9H", "8S"), cards("TS")]);

        await store.when(event("cardClicked", {column: 0, index: 1}));

        expect(values().selected()).toBeNull();
        expect(values().moveCount()).toBe(0);
    });

    it("selects the cards of the next hint at each press, hides the hint after the last one, and forgets it after a move", async () => {
        await deal([cards("_2C", "8S"), cards("9H"), cards("9S"), cards("_4C", "5D"), cards("6C")]);

        await store.when(event("hintRequested"));
        expect(values().hint()).toEqual({kind: "move", from: {column: 0, index: 1}});
        expect(values().selected()).toEqual({column: 0, index: 1});
        expect(values().destinations()).toEqual([1, 2]);
        await store.when(event("hintRequested"));
        expect(values().selected()).toEqual({column: 3, index: 1});
        expect(values().destinations()).toEqual([4]);
        await store.when(event("hintRequested"));
        expect(values().hint()).toBeNull();
        expect(values().selected()).toBeNull();
        await store.when(event("hintRequested"));
        expect(values().selected()).toEqual({column: 0, index: 1});

        await store.when(event("columnClicked", 2));
        expect(values().columns()[2].map(card => card.card)).toEqual(["9S", "8S"]);
        expect(values().hint()).toBeNull();
        expect(values().selected()).toBeNull();
    });

    it("hides a single hint when the button is pressed again", async () => {
        await deal([cards("_2C", "8S"), cards("9H")]);

        await store.when(event("hintRequested"));
        expect(values().hint()).toEqual({kind: "move", from: {column: 0, index: 1}});
        await store.when(event("hintRequested"));
        expect(values().hint()).toBeNull();
        expect(values().selected()).toBeNull();
        await store.when(event("hintRequested"));
        expect(values().hint()).toEqual({kind: "move", from: {column: 0, index: 1}});
    });

    it("deals a row from the stock only when no column is empty", async () => {
        const stock = cards(...Array.from({length: COLUMN_COUNT}, () => "_5C"));
        await deal([[], cards("KH", "QD")], {stock});

        await store.when(event("stockClicked"));
        expect(values().stockRowCount()).toBe(1);
        expect(values().isDealBlocked()).toBe(true);

        await store.when(event("cardsDropped", {from: {column: 1, index: 1}, to: 0}));
        await store.when(event("stockClicked"));
        expect(values().stockRowCount()).toBe(0);
        expect(column(0)).toEqual(["QD", "5C"]);
    });

    it("removes a completed sequence and wins with the eighth one", async () => {
        const completed = Array<Table["completed"][number]>(7).fill("S");
        await deal([cards(...SEQUENCE_WITHOUT_ACE), cards("AS"), ...NO_OTHER_CARDS], {completed});

        await store.when(event("cardsDropped", {from: {column: 1, index: 0}, to: 0}));

        expect(column(0)).toEqual([]);
        expect(values().completed()).toHaveLength(8);
        expect(values().hasGameEnded()).toBe(true);
        // the applause waits for the victory message
        expect(audioService.playApplause).not.toHaveBeenCalled();

        await store.when(event("victoryShown"));
        expect(audioService.playApplause).toHaveBeenCalled();
    });

    it("undoes the last move, including the card turned over and the sequence removed", async () => {
        await deal([cards("_4D", ...SEQUENCE_WITHOUT_ACE), cards("AS")]);
        await store.when(event("cardsDropped", {from: {column: 1, index: 0}, to: 0}));
        expect(column(0)).toEqual(["4D"]);

        await store.when(event("undoRequested"));

        expect(column(0)).toEqual(["_4D", ...SEQUENCE_WITHOUT_ACE]);
        expect(column(1)).toEqual(["AS"]);
        expect(values().completed()).toEqual([]);
        expect(values().canUndo()).toBe(false);
    });

    it("starts over when the player wants to play again", async () => {
        await deal([cards("8S"), cards("9H")]);
        await store.when(event("cardsDropped", {from: {column: 0, index: 0}, to: 1}));

        await store.when(event("playAgainRequested"));

        expect(values().moveCount()).toBe(0);
        expect(values().columns().flat()).toEqual([]);
    });

    it("saves the game after each move, with what the undo needs", async () => {
        await deal([cards("_4D", "8S"), cards("9H")]);
        expect(spiderSaveService.load(ONE_SUIT)?.moveCount).toBe(0);

        await store.when(event("cardsDropped", {from: {column: 0, index: 1}, to: 1}));

        const saved = spiderSaveService.load(ONE_SUIT);
        expect(saved?.moveCount).toBe(1);
        expect(saved?.table.columns[1].map(c => c.card)).toEqual(["9H", "8S"]);
        expect(saved?.history).toHaveLength(1);
    });

    it("saves every move for the undo, however long the game", async () => {
        await deal([cards("8S"), cards("9H"), cards("9D")]);
        await store.when(event("cardsDropped", {from: {column: 0, index: 0}, to: 1}));
        // the 8 goes back and forth between the two nines
        for (let i = 1; i < 150; i++) {
            const from = i % 2 === 1 ? 1 : 2;
            await store.when(event("cardsDropped", {from: {column: from, index: 1}, to: 3 - from}));
        }
        expect(values().moveCount()).toBe(150);
        expect(spiderSaveService.load(ONE_SUIT)?.history).toHaveLength(150);
    });

    it("resumes the saved game, undo included", async () => {
        await deal([cards("_4D", "8S"), cards("9H")]);
        await store.when(event("cardsDropped", {from: {column: 0, index: 1}, to: 1}));
        const resumed = initTestStore(gameDef({audioService, spiderSaveService}));

        await resumed.when(event("restoreRequested", {suitCount: 1, cardCount: 104}));

        const resumedValues = resumed.getValues("");
        expect(resumedValues.moveCount()).toBe(1);
        expect(resumedValues.columns()[1].map(c => c.card)).toEqual(["9H", "8S"]);
        await resumed.when(event("undoRequested"));
        expect(resumed.getValues("").columns()[0].map(c => c.card)).toEqual(["4D", "8S"]);
    });

    it("forgets the saved game once it is won", async () => {
        const completed = Array<Table["completed"][number]>(7).fill("S");
        await deal([cards(...SEQUENCE_WITHOUT_ACE), cards("AS"), ...NO_OTHER_CARDS], {completed});

        await store.when(event("cardsDropped", {from: {column: 1, index: 0}, to: 0}));

        expect(spiderSaveService.load(ONE_SUIT)).toBeNull();
    });
});
