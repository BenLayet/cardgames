import type {ExtractComponentValuesContract, Selectors,} from "@softer-components/types";

import {type PlayerState, type State} from "./game.component.state.ts";
import {type Card, type CardWithPlacement, cardValue, isFirstCardHigherValue} from "../../../../model/deck.model.ts";
import {pipe} from "../../../../utils/function.utils.ts";
import {and, not} from "@softer-components/utils";


const player1 = (state: State) => state.player1;
const player2 = (state: State) => state.player2;
const remainingCards = (player: PlayerState) => player.remainingCards;
const beingPlayedCards = (player: PlayerState): Card[] => player.beingPlayedCards;
const lastCard = (cards: Card[]) => cards[cards.length - 1];
const wonCards = (player: PlayerState) => player.wonCards;
const cardsBeingPlayedUpStates = (player: PlayerState) => player.beingPlayedCardsUpStates;
const canPlay = (player: PlayerState) => player.canPlay;

const player1RemainingCards = pipe(player1, remainingCards);
const player2RemainingCards = pipe(player2, remainingCards);

const player1BeingPlayedCards = pipe(player1, beingPlayedCards);
const player2BeingPlayedCards = pipe(player2, beingPlayedCards);
const player1BeingPlayedCard = pipe(player1BeingPlayedCards, lastCard);
const player2BeingPlayedCard = pipe(player2BeingPlayedCards, lastCard);

const player1BeingPlayedUpStates = pipe(player1, cardsBeingPlayedUpStates);
const player2BeingPlayedUpStates = pipe(player2, cardsBeingPlayedUpStates);
const hasPlayer1WonRound = (state: State) =>
    isFirstCardHigherValue(player1BeingPlayedCard(state), player2BeingPlayedCard(state));
const player1CardCount = (state: State) => player1RemainingCards(state).length + player1WonCards(state).length;
const player2CardCount = (state: State) => player2RemainingCards(state).length + player2WonCards(state).length;

const hasPlayer2WonRound = (state: State) =>
    isFirstCardHigherValue(player2BeingPlayedCard(state), player1BeingPlayedCard(state));

const player1WonCards = pipe(player1, wonCards);
const player2WonCards = pipe(player2, wonCards);

const isStackEmpty = (cards: Card[]) => cards.length === 0;
const shouldPlayer1RestackRemainingCards = and(pipe(player1RemainingCards, isStackEmpty), pipe(player1WonCards, not(isStackEmpty)));
const shouldPlayer2RestackRemainingCards = and(pipe(player2RemainingCards, isStackEmpty), pipe(player2WonCards, not(isStackEmpty)));

const hasPlayer1WonGame = (state: State) => player2CardCount(state) === 0 && player1CardCount(state) > 0;
const hasPlayer2WonGame = (state: State) => player1CardCount(state) === 0 && player2CardCount(state) > 0;
const isTiedGame = (state: State) => player1CardCount(state) === 0 && player2CardCount(state) === 0;
const hasGameEnded = (state: State) => state.gameEnded;

const isTopPairHidden = (state: State) => {
    const upStates = player1BeingPlayedUpStates(state);
    return upStates.length > 0 && !upStates[upStates.length - 1];
};
const areCardsBeingPlayed = (state: State) => player1BeingPlayedCards(state).length > 0;

// Number of battles in the current round: each revealed pair of equal cards (at even indexes) is a battle.
// It is 0 when there is no battle or once the round has a winner.
const battleCount = (state: State) => {
    if (state.roundWinner !== null) return 0;
    const player1Cards = player1BeingPlayedCards(state);
    const player2Cards = player2BeingPlayedCards(state);
    const player1UpStates = player1BeingPlayedUpStates(state);
    const player2UpStates = player2BeingPlayedUpStates(state);
    let count = 0;
    for (let i = 0; i < player1Cards.length && i < player2Cards.length; i += 2) {
        if (!player1UpStates[i] || !player2UpStates[i]) break;
        if (cardValue(player1Cards[i]) !== cardValue(player2Cards[i])) break;
        count++;
    }
    return count;
};

const haveBothPlayerPlayed = (state: State) => player2BeingPlayedCards(state).length === player1BeingPlayedCards(state).length && player1BeingPlayedCards(state).length > 0;
const canPlayer1Play = and(pipe(player1, canPlay), not(shouldPlayer1RestackRemainingCards));
const canPlayer2Play = and(pipe(player2, canPlay), not(shouldPlayer2RestackRemainingCards));
const shouldCardsBeShown = (state: State) => haveBothPlayerPlayed(state) && player1BeingPlayedCards(state).length % 2 === 1;
const cardsWithLocation = (state: State): CardWithPlacement[] => ([
    ...player1BeingPlayedCards(state).map((card, index) => ({
        card,
        placement:{
            stackLocation: "player1BeingPlayedCards" as const,
            stackIndex:3,
            index,
            faceUp: player1BeingPlayedUpStates(state)[index],
            messyLevel: 2
        }
    })),
    ...player2BeingPlayedCards(state).map((card, index) => ({
        card,
        placement:{
            stackLocation: "player2BeingPlayedCards" as const,
            stackIndex:3,
            index,
            faceUp: player2BeingPlayedUpStates(state)[index],
            messyLevel: 2
        }
    })),
    ...player1RemainingCards(state).map((card, index) => ({
        card,
        placement:{
            stackLocation: "player1RemainingCards" as const,
            stackIndex:1,
            index,
            faceUp: false,
            messyLevel: 2
        }
    })),
    ...player2RemainingCards(state).map((card, index) => ({
        card,
        placement:{
            stackLocation: "player2RemainingCards" as const,
            stackIndex:1,
            index,
            faceUp: false,
            messyLevel: 2
        }
    })),
    ...player1WonCards(state).map((card, index) => ({
        card,
        placement:{
            stackLocation: "player1WonCards" as const,
            stackIndex:2,
            index,
            faceUp: true,
            messyLevel: 10
        }
    })),
    ...player2WonCards(state).map((card, index) => ({
        card,
        placement:{
            stackLocation: "player2WonCards" as const,
            stackIndex:2,
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
    isTopPairHidden,
    areCardsBeingPlayed,
    battleCount,
} satisfies Selectors<State>;
export type Values = ExtractComponentValuesContract<typeof selectors>;
