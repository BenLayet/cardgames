import {describe, expect, it} from "vitest";

import {decodeSavedGame, encodeSavedGame} from "./spider-save.codec.ts";
import {createSpiderDeck, dealRow, dealTable, type SavedSpiderGame} from "../model/spider.model.ts";

const dealt = dealTable(createSpiderDeck(4, 104));
const game: SavedSpiderGame = {table: dealRow(dealt), history: [dealt], moveCount: 1};

describe("saved game codec", () => {
    it("reads back the saved game", () => {
        expect(decodeSavedGame(encodeSavedGame(game))).toEqual(game);
    });

    it("reads back completed sequences and empty columns", () => {
        const oneSuit = dealTable(createSpiderDeck(1, 104));
        // column 0 emptied and 13 cards gone with the completed sequence
        const table = {columns: [[], ...oneSuit.columns.slice(1)], stock: oneSuit.stock.slice(7), completed: ["S" as const], cardCount: 104};
        const saved = {table, history: [oneSuit], moveCount: 42};
        expect(decodeSavedGame(encodeSavedGame(saved))).toEqual(saved);
    });

    it("reads back a game of 32 cards", () => {
        const short = dealTable(createSpiderDeck(2, 32));
        const saved = {table: short, history: [], moveCount: 0};
        expect(decodeSavedGame(encodeSavedGame(saved))).toEqual(saved);
    });

    it("reads a game saved without its number of cards", () => {
        const fiftyTwo = dealTable(createSpiderDeck(1, 52));
        const withoutCardCount = encodeSavedGame({table: fiftyTwo, history: [], moveCount: 0}).replace(/;52"/, '"');
        expect(withoutCardCount).not.toContain(";52");
        expect(decodeSavedGame(withoutCardCount)?.table).toEqual(fiftyTwo);
    });

    it("keeps a long game small", () => {
        const history = Array.from({length: 1000}, () => dealt);
        expect(encodeSavedGame({...game, history}).length).toBeLessThan(1000 * 800);
    });

    it("still reads a game saved as plain JSON by the previous version", () => {
        expect(decodeSavedGame(JSON.stringify(game))).toEqual(game);
    });

    it.each(["", "not json", "{\"format\":2,\"table\":\"x\",\"history\":[],\"moveCount\":0}"])("ignores %j", text => {
        expect(decodeSavedGame(text)).toBeNull();
    });
});
