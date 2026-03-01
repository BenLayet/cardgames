import type {StateUpdaters} from "@softer-components/types";

import type {Contract} from "./game.component.contract.ts";
import {type State} from "./game.component.state.ts";
import {assertIsNotUndefined} from "@softer-components/utils";

export const stateUpdaters: StateUpdaters<Contract, State> = {
    dealCompleted: ({state, payload}) => {
        state.player1.remainingCards = payload.player1Cards;
        state.player2.remainingCards = payload.player2Cards;
    },
    player1Played: ({state}) => {
        const beingPlayedCard = state.player1.remainingCards.pop();
        assertIsNotUndefined(beingPlayedCard)
        state.player1.beingPlayedCards.push(beingPlayedCard);
        state.player1.beingPlayedCardsUpStates.push(false);
    },
    player2Played: ({state}) => {
        const beingPlayedCard = state.player2.remainingCards.pop();
        assertIsNotUndefined(beingPlayedCard)
        state.player2.beingPlayedCards.push(beingPlayedCard);
        state.player2.beingPlayedCardsUpStates.push(false);
    },
    player1PlacedHiddenCard: ({state}) => {
        const beingPlayedCard = state.player1.remainingCards.pop();
        assertIsNotUndefined(beingPlayedCard)
        state.player1.beingPlayedCards.push(beingPlayedCard);
        state.player1.beingPlayedCardsUpStates.push(false);
    },
    player2PlacedHiddenCard: ({state}) => {
        const beingPlayedCard = state.player2.remainingCards.pop();
        assertIsNotUndefined(beingPlayedCard)
        state.player2.beingPlayedCards.push(beingPlayedCard);
        state.player2.beingPlayedCardsUpStates.push(false);
    },
    cardsAcknowledgmentStarted: ({state}) => {
        state.player1.beingPlayedCardsUpStates[state.player1.beingPlayedCardsUpStates.length - 1] = true;
        state.player2.beingPlayedCardsUpStates[state.player2.beingPlayedCardsUpStates.length - 1] = true;
    },
    player1WonRound: ({state}) => {
        state.player1.wonCards = [...state.player1.wonCards, ...state.player2.beingPlayedCards, ...state.player1.beingPlayedCards];
    },
    player2WonRound: ({state}) => {
        state.player2.wonCards = [...state.player2.wonCards, ...state.player1.beingPlayedCards, ...state.player2.beingPlayedCards];
    },
    roundCompleted: ({state}) => {
        state.player1.beingPlayedCards = [];
        state.player1.beingPlayedCardsUpStates = [];
        state.player2.beingPlayedCards = [];
        state.player2.beingPlayedCardsUpStates = [];
    },
};
