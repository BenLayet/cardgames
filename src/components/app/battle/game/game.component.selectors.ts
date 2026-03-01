import type {ExtractComponentValuesContract, Selectors,} from "@softer-components/types";

import {type PlayerState, type State} from "./game.component.state.ts";
import {type Card, type CardLocation, DECK, isFirstCardHigherValue} from "../../../../model/deck.model.ts";
import {flow} from "lodash";


const player1 = (state: State) => state.player1;
const player2 = (state: State) => state.player2;
const remainingCards = (player: PlayerState) => player.remainingCards;
const beingPlayedCards = (player: PlayerState) => player.beingPlayedCards;
const lastCard = (cards: Card[]) => cards[cards.length - 1];
const wonCards = (player: PlayerState) => player.wonCards;
const cardsBeingPlayedUpStates = (player: PlayerState) => player.beingPlayedCardsUpStates;
const shouldHiddenCardBeGiven = (cardsBeingPlayed: Card[]) => cardsBeingPlayed.length % 2 === 1;

const player1RemainingCards = flow(player1, remainingCards);
const player2RemainingCards = flow(player2, remainingCards);

const player1BeingPlayedCards = flow(player1, beingPlayedCards);
const player2BeingPlayedCards = flow(player2, beingPlayedCards);
const player1BeingPlayedCard = flow(player1BeingPlayedCards, lastCard);
const player2BeingPlayedCard = flow(player2BeingPlayedCards, lastCard);
const shouldPlayer1GiveHiddenCard = flow(player1BeingPlayedCards, shouldHiddenCardBeGiven);
const shouldPlayer2GiveHiddenCard = flow(player2BeingPlayedCards, shouldHiddenCardBeGiven);

const player1BeingPlayedUpStates = flow(player1, cardsBeingPlayedUpStates);
const player2BeingPlayedUpStates = flow(player2, cardsBeingPlayedUpStates);
const hasPlayer1WonRound = (state: State) =>
    isFirstCardHigherValue(player1BeingPlayedCard(state), player2BeingPlayedCard(state));
const hasPlayer2WonRound = (state: State) =>
    isFirstCardHigherValue(player2BeingPlayedCard(state), player1BeingPlayedCard(state));

const player1WonCards = flow(player1, wonCards);
const player2WonCards = flow(player2, wonCards);

const isStackEmpty = (cards: Card[]) => cards.length === 0;
const shouldPlayer1PutCardsBackInHand = flow(player1RemainingCards, isStackEmpty);
const shouldPlayer2PutCardsBackInHand = flow(player2RemainingCards, isStackEmpty);

const cardLocation = (state: State) =>
    (card: Card): CardLocation => {
        if (player1BeingPlayedCards(state).includes(card)) {
            return {
                stackLocation: "player1BeingPlayedCards",
                index: player1BeingPlayedCards(state).indexOf(card),
                faceUp: player1BeingPlayedUpStates(state)[player1BeingPlayedCards(state).indexOf(card)],
                messyLevel: 2,
            };
        }
        if (player2BeingPlayedCards(state).includes(card)) {
            return {
                stackLocation: "player2BeingPlayedCards",
                index: player2BeingPlayedCards(state).indexOf(card),
                faceUp: player2BeingPlayedUpStates(state)[player2BeingPlayedCards(state).indexOf(card)],
                messyLevel: 2,
            };
        }
        if (player1RemainingCards(state).includes(card)) {
            return {
                stackLocation: "player1RemainingCards", index: player1RemainingCards(state).indexOf(card),
                faceUp: false,
                messyLevel: 0,
            };
        }
        if (player2RemainingCards(state).includes(card)) {
            return {
                stackLocation: "player2RemainingCards",
                index: player2RemainingCards(state).indexOf(card),
                faceUp: false,
                messyLevel: 0,
            };
        }
        if (player1WonCards(state).includes(card)) {
            return {
                stackLocation: "player1WonCards", index: player1WonCards(state).indexOf(card), faceUp: true,
                messyLevel: 10,
            };
        }
        if (player2WonCards(state).includes(card)) {
            return {
                stackLocation: "player2WonCards", index: player2WonCards(state).indexOf(card), faceUp: true,
                messyLevel: 10
            };
        }
        return {stackLocation: "deck", index: DECK.indexOf(card), faceUp: false,
            messyLevel: 0,};
    }
const cardsWithLocation = (state: State) => DECK.map(card => ({card, location: cardLocation(state)(card)}));
export const selectors = {
    hasPlayer1WonRound,
    hasPlayer2WonRound,
    shouldPlayer1GiveHiddenCard,
    shouldPlayer2GiveHiddenCard,
    cardsWithLocation,
    shouldPlayer1PutCardsBackInHand,
    shouldPlayer2PutCardsBackInHand,
} satisfies Selectors<State>;
export type Values = ExtractComponentValuesContract<typeof selectors>;
