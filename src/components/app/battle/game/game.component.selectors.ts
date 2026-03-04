import type {ExtractComponentValuesContract, Selectors,} from "@softer-components/types";

import {type PlayerState, type State} from "./game.component.state.ts";
import {type Card, type CardWithPlacement, isFirstCardHigherValue} from "../../../../model/deck.model.ts";
import {flow} from "lodash";
import {and, not} from "@softer-components/utils";


const player1 = (state: State) => state.player1;
const player2 = (state: State) => state.player2;
const remainingCards = (player: PlayerState) => player.remainingCards;
const beingPlayedCards = (player: PlayerState): Card[] => player.beingPlayedCards;
const lastCard = (cards: Card[]) => cards[cards.length - 1];
const wonCards = (player: PlayerState) => player.wonCards;
const cardsBeingPlayedUpStates = (player: PlayerState) => player.beingPlayedCardsUpStates;
const canPlay = (player: PlayerState) => player.canPlay;

const player1RemainingCards = flow(player1, remainingCards);
const player2RemainingCards = flow(player2, remainingCards);

const player1BeingPlayedCards = flow(player1, beingPlayedCards);
const player2BeingPlayedCards = flow(player2, beingPlayedCards);
const player1BeingPlayedCard = flow(player1BeingPlayedCards, lastCard);
const player2BeingPlayedCard = flow(player2BeingPlayedCards, lastCard);

const player1BeingPlayedUpStates = flow(player1, cardsBeingPlayedUpStates);
const player2BeingPlayedUpStates = flow(player2, cardsBeingPlayedUpStates);
const hasPlayer1WonRound = (state: State) =>
    isFirstCardHigherValue(player1BeingPlayedCard(state), player2BeingPlayedCard(state));
const player1CardCount = (state: State) => player1RemainingCards(state).length + player1WonCards(state).length;
const player2CardCount = (state: State) => player2RemainingCards(state).length + player2WonCards(state).length;

const hasPlayer2WonRound = (state: State) =>
    isFirstCardHigherValue(player2BeingPlayedCard(state), player1BeingPlayedCard(state));

const player1WonCards = flow(player1, wonCards);
const player2WonCards = flow(player2, wonCards);

const isStackEmpty = (cards: Card[]) => cards.length === 0;
const shouldPlayer1RestackRemainingCards = and(flow(player1RemainingCards, isStackEmpty), flow(player1WonCards, not(isStackEmpty)));
const shouldPlayer2RestackRemainingCards = and(flow(player2RemainingCards, isStackEmpty), flow(player2WonCards, not(isStackEmpty)));

const hasPlayer1WonGame = (state: State) => player2CardCount(state) === 0 && player1CardCount(state) > 0;
const hasPlayer2WonGame = (state: State) => player1CardCount(state) === 0 && player2CardCount(state) > 0;
const isTiedGame = (state: State) => player1CardCount(state) === 0 && player2CardCount(state) === 0;
const hasGameEnded = (state: State) => state.gameEnded;

const haveBothPlayerPlayed = (state: State) => player2BeingPlayedCards(state).length === player1BeingPlayedCards(state).length && player1BeingPlayedCards(state).length > 0;
const canPlayer1Play = and(flow(player1, canPlay), not(shouldPlayer1RestackRemainingCards));
const canPlayer2Play = and(flow(player2, canPlay), not(shouldPlayer2RestackRemainingCards));
const shouldCardsBeShown = (state: State) => haveBothPlayerPlayed(state) && player1BeingPlayedCards(state).length % 2 === 1;
const cardsWithLocation = (state: State): CardWithPlacement[] => ([
    ...player1BeingPlayedCards(state).map((card, index) => ({
        card,
        placement:{
            stackLocation: "player1BeingPlayedCards" as const,
            index,
            faceUp: player1BeingPlayedUpStates(state)[index],
            messyLevel: 2
        }
    })),
    ...player2BeingPlayedCards(state).map((card, index) => ({
        card,
        placement:{
            stackLocation: "player2BeingPlayedCards" as const,
            index,
            faceUp: player2BeingPlayedUpStates(state)[index],
            messyLevel: 2
        }
    })),
    ...player1RemainingCards(state).map((card, index) => ({
        card,
        placement:{
            stackLocation: "player1RemainingCards" as const,
            index,
            faceUp: false,
            messyLevel: 2
        }
    })),
    ...player2RemainingCards(state).map((card, index) => ({
        card,
        placement:{
            stackLocation: "player2RemainingCards" as const,
            index,
            faceUp: false,
            messyLevel: 2
        }
    })),
    ...player1WonCards(state).map((card, index) => ({
        card,
        placement:{
            stackLocation: "player1WonCards" as const,
            index,
            faceUp: true,
            messyLevel: 10
        }
    })),
    ...player2WonCards(state).map((card, index) => ({
        card,
        placement:{
            stackLocation: "player2WonCards" as const,
            index,
            faceUp: true,
            messyLevel: 10
        }
    })),
]);
export const selectors = {
    canPlayer1Play,
    canPlayer2Play,
    shouldCardsBeShown,
    haveBothPlayerPlayed,
    hasPlayer1WonRound,
    hasPlayer2WonRound,
    cardsWithLocation,
    shouldPlayer1RestackRemainingCards,
    shouldPlayer2RestackRemainingCards,
    hasPlayer1WonGame,
    hasPlayer2WonGame,
    isTiedGame,
    hasGameEnded,
} satisfies Selectors<State>;
export type Values = ExtractComponentValuesContract<typeof selectors>;
