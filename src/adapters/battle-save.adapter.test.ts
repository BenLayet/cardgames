import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";

import {decodeSavedBattleGame, encodeSavedBattleGame, LocalStorageBattleSaveAdapter} from "./battle-save.adapter.ts";
import type {SavedBattleGame} from "../services/battle-save.service.ts";

const seat = {pile: ["AS", "2H"], played: ["KD"], playedUp: [true], rank: null, eliminatedRound: null};
const game: SavedBattleGame = {
    seats: [seat, seat, {...seat, pile: [], played: [], playedUp: [], rank: 3, eliminatedRound: 12}] as SavedBattleGame["seats"],
    contenders: [0, 1], step: "down", battleCount: 1, roundNumber: 14, lastRoundWinner: 1, lastWonCount: 6, setAsideCount: 1,
    hasPlayed: true, isSolo: false, playerNames: [null, "Léa", "Tom"], dealSeed: 123456,
};

describe("saved Bataille game", () => {
    it("reads back a stored game", () => {
        expect(decodeSavedBattleGame(encodeSavedBattleGame(game))).toEqual(game);
    });

    it("ignores a stored text that is not a game", () => {
        expect(decodeSavedBattleGame("not json")).toBeNull();
        expect(decodeSavedBattleGame(encodeSavedBattleGame({...game, seats: [{...seat, pile: ["XX"]}, seat]} as unknown as SavedBattleGame))).toBeNull();
        expect(decodeSavedBattleGame(encodeSavedBattleGame({...game, lastRoundWinner: 3}))).toBeNull();
        expect(decodeSavedBattleGame(JSON.stringify({...game, version: 3}))).toBeNull();
    });

    it("reads a game saved between two players before games of up to 6, the cards on the table back under their pile", () => {
        const player = {remainingCards: ["AS", "2H"], wonCards: ["3C"], beingPlayedCards: ["KD"], beingPlayedCardsUpStates: [true]};
        const old = {player1: player, player2: {...player, remainingCards: ["QS"]}, isPlayer2Computer: true, playerNames: [null, null], hasPlayed: true, lastRoundWinner: "player2"};
        expect(decodeSavedBattleGame(JSON.stringify(old))).toEqual({
            seats: [
                {pile: ["KD", "3C", "AS", "2H"], played: [], playedUp: [], rank: null, eliminatedRound: null},
                {pile: ["KD", "3C", "QS"], played: [], playedUp: [], rank: null, eliminatedRound: null},
            ],
            contenders: [0, 1], step: "up", battleCount: 0, roundNumber: 1, lastRoundWinner: 1, lastWonCount: 0, setAsideCount: 0,
            hasPlayed: true, isSolo: true, playerNames: [null, null], dealSeed: null,
        });
    });

    it("reads a game saved before the cards collected were shuffled: they go on being collected in seat order", () => {
        const older: Partial<SavedBattleGame> = {...game};
        delete older.dealSeed;
        expect(decodeSavedBattleGame(JSON.stringify({version: 2, ...older}))).toEqual({...game, dealSeed: null});
    });
});

describe("saved Bataille games in the browser", () => {
    let stored: Map<string, string>;
    beforeEach(() => {
        stored = new Map();
        vi.stubGlobal("localStorage", {
            getItem: (key: string) => stored.get(key) ?? null,
            setItem: (key: string, value: string) => stored.set(key, value),
            removeItem: (key: string) => stored.delete(key),
            key: (index: number) => [...stored.keys()][index] ?? null,
            get length() {
                return stored.size;
            },
        });
    });
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("keeps one game for each kind of game", () => {
        const adapter = new LocalStorageBattleSaveAdapter();
        adapter.save({players: "solo", cardCount: 32}, {...game, isSolo: true});
        adapter.save({players: 3, cardCount: 32}, game);
        adapter.save({players: 3, cardCount: 52}, game);
        adapter.clear({players: 3, cardCount: 52});

        expect(adapter.savedVariants()).toEqual([{players: "solo", cardCount: 32}, {players: 3, cardCount: 32}]);
        expect(adapter.load({players: "solo", cardCount: 32})?.isSolo).toBe(true);
        expect(adapter.load({players: 2, cardCount: 32})).toBeNull();
    });

    it("moves the single game saved before to the key of its kind", () => {
        // three players, 4 + 1 cards each and 1 set aside: 16 cards
        const seats = [0, 1, 2].map(() => ({pile: ["AS", "2H", "3C", "4D"], played: ["KD"], playedUp: [true], rank: null, eliminatedRound: null}));
        stored.set("cardgames.bataille.game", encodeSavedBattleGame({...game, seats} as SavedBattleGame));

        const adapter = new LocalStorageBattleSaveAdapter();

        expect(adapter.savedVariants()).toEqual([{players: 3, cardCount: 16}]);
        expect(stored.has("cardgames.bataille.game")).toBe(false);
    });
});
