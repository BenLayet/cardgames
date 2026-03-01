import type {Card} from "../../../../model/deck.model.ts";

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
    deck: [] as Card[],
}

export type State = typeof initialState;
export type PlayerState = typeof initialPlayerState;
