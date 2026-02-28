import type {Card} from "../../../../model/deck.model.ts";

export const initialPlayerState = {
    remainingCards: [] as Card[],
    wonCards: [] as Card[],
    beingPlayedCards: [] as Card[],
    beingPlayedCardsUpStates: [] as boolean[],
};

export const initialState = {
    player1: initialPlayerState,
    player2: initialPlayerState,
}

export type State = typeof initialState;
export type PlayerState = typeof initialPlayerState;
