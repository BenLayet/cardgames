import type {Card} from "../model/deck.model.ts";

// the cards of a seat between two rounds: in a battle, the cards on the table stay there
export type SavedBattleSeat = {
    pile: Card[],
    played: Card[],
    playedUp: boolean[],
    rank: number | null,
    eliminatedRound: number | null,
};
export type SavedBattleGame = {
    seats: SavedBattleSeat[],
    contenders: number[],
    step: "up" | "down",
    battleCount: number,
    roundNumber: number,
    lastRoundWinner: number | null,
    lastWonCount: number,
    setAsideCount: number,
    hasPlayed: boolean,
    isSolo: boolean,
    playerNames: (string | null)[],
    // how the cards collected are shuffled, null in a game saved before they were
    dealSeed: number | null,
};

// Keeps the Bataille game in progress so that it can be resumed after going back or closing the application
export interface BattleSaveService {
    // null when there is no game to resume
    load(): SavedBattleGame | null;
    save(game: SavedBattleGame): void;
    clear(): void;
    hasSavedGame(): boolean;
}
