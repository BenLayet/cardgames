import {describe, expect, it} from "vitest";

import {decodeSavedBattleGame} from "./battle-save.adapter.ts";

const player = {remainingCards: ["AS", "2H"], wonCards: [], beingPlayedCards: ["KD"], beingPlayedCardsUpStates: [true]};
const game = {player1: player, player2: player, isPlayer2Computer: true, playerNames: [null, "Léa"], hasPlayed: true, lastRoundWinner: "player2"};

describe("saved Bataille game", () => {
    it("reads back a stored game", () => {
        expect(decodeSavedBattleGame(JSON.stringify(game))).toEqual(game);
    });

    it("ignores a stored text that is not a game", () => {
        expect(decodeSavedBattleGame("not json")).toBeNull();
        expect(decodeSavedBattleGame(JSON.stringify({...game, player1: {...player, remainingCards: ["XX"]}}))).toBeNull();
        expect(decodeSavedBattleGame(JSON.stringify({...game, lastRoundWinner: "player3"}))).toBeNull();
    });
});
