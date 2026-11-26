import {describe, expect, it} from "vitest";

import {decodeSavedBattleGame, encodeSavedBattleGame} from "./battle-save.adapter.ts";
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
