import type {Card} from "../model/deck.model.ts";

// the stacks of a player between two rounds: in a battle, the cards on the table stay there
export type SavedBattlePlayer = {
    remainingCards: Card[],
    wonCards: Card[],
    beingPlayedCards: Card[],
    beingPlayedCardsUpStates: boolean[],
};
export type SavedBattleGame = {
    player1: SavedBattlePlayer,
    player2: SavedBattlePlayer,
    isPlayer2Computer: boolean,
    playerNames: (string | null)[],
    hasPlayed: boolean,
    lastRoundWinner: "player1" | "player2" | null,
};

// Keeps the Bataille game in progress so that it can be resumed after going back or closing the application
export interface BattleSaveService {
    // null when there is no game to resume
    load(): SavedBattleGame | null;
    save(game: SavedBattleGame): void;
    clear(): void;
    hasSavedGame(): boolean;
}
