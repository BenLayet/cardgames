import {describe, expect, it} from "vitest";

import {decodeSavedGame, encodeSavedGame} from "./spider-save.codec.ts";
import {shrinkGame} from "./spider-save.adapter.ts";
import {createSpiderDeck, dealRow, dealTable, type SavedSpiderGame} from "../model/spider.model.ts";

const dealt = dealTable(createSpiderDeck(4, 104));
const game: SavedSpiderGame = {table: dealRow(dealt), history: [dealt], moveCount: 1, positions: [], elapsedMs: 754_000};
const position = {table: dealt, history: [], moveCount: 0, savedAt: 1764237600000};

describe("saved game codec", () => {
    it("reads back the saved game", () => {
        expect(decodeSavedGame(encodeSavedGame(game))).toEqual(game);
    });

    it("reads back a game of half a deck", () => {
        const saved = {table: dealTable(createSpiderDeck(2, 26)), history: [], moveCount: 0, positions: [], elapsedMs: 0};
        expect(decodeSavedGame(encodeSavedGame(saved))).toEqual(saved);
    });

    it("reads back completed sequences and empty columns", () => {
        const oneSuit = dealTable(createSpiderDeck(1, 104));
        // column 0 emptied and 13 cards gone with the completed sequence
        const table = {columns: [[], ...oneSuit.columns.slice(1)], stock: oneSuit.stock.slice(7), completed: ["S" as const]};
        const saved = {table, history: [oneSuit], moveCount: 42, positions: [], elapsedMs: null};
        expect(decodeSavedGame(encodeSavedGame(saved))).toEqual(saved);
    });

    it("keeps a long game small", () => {
        const history = Array.from({length: 1000}, () => dealt);
        expect(encodeSavedGame({...game, history}).length).toBeLessThan(1000 * 800);
    });

    it("reads back the positions saved by the player, with their undo", () => {
        const saved = {...game, positions: [position, {table: game.table, history: game.history, moveCount: 1, savedAt: 1764238000000}]};
        expect(decodeSavedGame(encodeSavedGame(saved))).toEqual(saved);
    });

    it("still reads a game saved as plain JSON by the first version", () => {
        const {table, history, moveCount} = game;
        expect(decodeSavedGame(JSON.stringify({table, history, moveCount}))).toEqual({...game, elapsedMs: null});
    });

    it("still reads a game saved before the positions, without any", () => {
        const saved = JSON.parse(encodeSavedGame(game)) as Record<string, unknown>;
        delete saved.positions;
        expect(decodeSavedGame(JSON.stringify({...saved, format: 2}))).toEqual({...game, elapsedMs: null});
    });

    it("still reads a game saved before the time was measured, its time unknown", () => {
        const saved = JSON.parse(encodeSavedGame(game)) as Record<string, unknown>;
        delete saved.elapsedMs;
        expect(decodeSavedGame(JSON.stringify({...saved, format: 3}))).toEqual({...game, elapsedMs: null});
    });

    it("ignores a game saved by a newer version", () => {
        const saved = JSON.parse(encodeSavedGame(game)) as Record<string, unknown>;
        expect(decodeSavedGame(JSON.stringify({...saved, format: 5}))).toBeNull();
    });

    it.each(["", "[]", "{\"table\":1}", "not json", "{\"format\":2,\"table\":\"x\",\"history\":[],\"moveCount\":0}"])("ignores %j", text => {
        expect(decodeSavedGame(text)).toBeNull();
    });
});

describe("a saved game too big for the storage", () => {
    it("keeps the newer half of every undo, the saved positions' too", () => {
        const long = {...game, history: [dealt, dealt, dealt, dealt], positions: [{...position, history: [dealt, dealt]}]};
        const smaller = shrinkGame(long);
        expect(smaller?.history).toHaveLength(2);
        expect(smaller?.positions[0].history).toHaveLength(1);
    });

    it("drops the oldest saved position once nothing is left to undo, then gives up", () => {
        const twoPositions = {...game, history: [], positions: [position, {...position, savedAt: 2}]};
        expect(shrinkGame(twoPositions)?.positions.map(p => p.savedAt)).toEqual([2]);
        expect(shrinkGame({...game, history: []})).toBeNull();
    });
});
