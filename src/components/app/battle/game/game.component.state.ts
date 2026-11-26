import type {Card} from "../../../../model/deck.model.ts";

export const PLAYERS = ["player1", "player2"] as const;
export type PlayerId = (typeof PLAYERS)[number];
export const opponentOf = (id: PlayerId): PlayerId => id === "player1" ? "player2" : "player1";

export const initialPlayerState = {
    remainingCards: [] as Card[],
    wonCards: [] as Card[],
    beingPlayedCards: [] as Card[],
    beingPlayedCardsUpStates: [] as boolean[],
    canPlay: false,
};

export const initialState = {
    player1: initialPlayerState,
    player2: initialPlayerState,
    gameEnded: false,
    roundWinner: null as PlayerId | null,
    // who won the last round, kept until the next one is won, to be said on the status line
    lastRoundWinner: null as PlayerId | null,
    // whether a card was played since the deal, the first one is announced on the status line
    hasPlayed: false,
    // otherwise a second human plays from the other side of the screen
    isPlayer2Computer: true,
    // the names typed on the setup screen, null for a player named after their number
    playerNames: [] as (string | null)[],
    // a resumed game shows its cards where they are, without dealing them
    isRestored: false,
}

export type State = typeof initialState;
export type PlayerState = typeof initialPlayerState;
