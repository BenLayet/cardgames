import type {StateUpdaters} from "@softer-components/types";

import type {Contract} from "./game.component.contract.ts";
import {initialState, type State} from "./game.component.state.ts";
import {assertIsNotUndefined} from "@softer-components/utils";

export const stateUpdaters: StateUpdaters<Contract, State> = {
    dealRequested: () => initialState,
    dealCompleted: ({state, payload}) => {
        state.player1.remainingCards = payload.player1Cards;
        state.player2.remainingCards = payload.player2Cards;
    },
    player1Played: ({state}) => {
        const beingPlayedCard = state.player1.remainingCards.pop();
        assertIsNotUndefined(beingPlayedCard)
        state.player1.beingPlayedCards.push(beingPlayedCard);
        state.player1.beingPlayedCardsUpStates.push(false);
        state.player1.canPlay = false;
    },
    player2Played: ({state}) => {
        const beingPlayedCard = state.player2.remainingCards.pop();
        assertIsNotUndefined(beingPlayedCard)
        state.player2.beingPlayedCards.push(beingPlayedCard);
        state.player2.beingPlayedCardsUpStates.push(false);
        state.player2.canPlay = false;
    },
    readyForNextCards: ({state}) => {
        state.player1.canPlay = true;
        state.player2.canPlay = true;
    },
    suspenseCompleted: ({state}) => {
        state.player1.beingPlayedCardsUpStates[state.player1.beingPlayedCardsUpStates.length - 1] = true;
        state.player2.beingPlayedCardsUpStates[state.player2.beingPlayedCardsUpStates.length - 1] = true;
    },
    player1WonRound: ({state}) => {
        state.player1.wonCards = [...state.player1.wonCards, ...state.player2.beingPlayedCards, ...state.player1.beingPlayedCards];
        state.player1.beingPlayedCards = [];
        state.player1.beingPlayedCardsUpStates = [];
        state.player2.beingPlayedCards = [];
        state.player2.beingPlayedCardsUpStates = [];
    },
    player2WonRound: ({state}) => {
        state.player2.wonCards = [...state.player2.wonCards, ...state.player1.beingPlayedCards, ...state.player2.beingPlayedCards];
        state.player1.beingPlayedCards = [];
        state.player1.beingPlayedCardsUpStates = [];
        state.player2.beingPlayedCards = [];
        state.player2.beingPlayedCardsUpStates = [];
    },
    player1RestackedRemainingCards: ({state}) => {
        state.player1.remainingCards = [...state.player1.remainingCards, ...state.player1.wonCards];
        state.player1.wonCards = [];
    },
    player2RestackedRemainingCards: ({state}) => {
        state.player2.remainingCards = [...state.player2.remainingCards, ...state.player2.wonCards];
        state.player2.wonCards = [];
    },
    gameEnded: ({state}) => {
        state.gameEnded = true;
    },
    playAgainRequested: () => initialState,
};
