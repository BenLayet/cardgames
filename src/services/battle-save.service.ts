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

// a kind of game: the choices of the Bataille menu, the players and the number of cards
export type BattleVariant = { players: "solo" | number, cardCount: number };
export const sameBattleVariant = (a: BattleVariant, b: BattleVariant) => a.players === b.players && a.cardCount === b.cardCount;
export const battleVariant = (isSolo: boolean, playerCount: number, cardCount: number): BattleVariant =>
    ({players: isSolo ? "solo" : playerCount, cardCount});
// the kind of a saved game: its players, and all its cards, those set aside included
export const variantOfSavedGame = (game: SavedBattleGame): BattleVariant => battleVariant(game.isSolo, game.seats.length,
    game.seats.reduce((count, seat) => count + seat.pile.length + seat.played.length, game.setAsideCount));

// Keeps the Bataille games in progress so that they can be resumed after going back or closing the application:
// one game for each kind of game
export interface BattleSaveService {
    // null when there is no game to resume with these choices
    load(variant: BattleVariant): SavedBattleGame | null;
    save(variant: BattleVariant, game: SavedBattleGame): void;
    clear(variant: BattleVariant): void;
    // the choices that have a game to resume
    savedVariants(): BattleVariant[];
}
