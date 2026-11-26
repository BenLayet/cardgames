import type {SavedBattleGame, SavedBattlePlayer} from "../../../../services/battle-save.service.ts";
import type {ExtractComponentValuesContract, Selectors,} from "@softer-components/types";

import {opponentOf, type PlayerId, PLAYERS, type PlayerState, type State} from "./game.component.state.ts";
import {
    type Card,
    type CardWithPlacement,
    cardValue,
    isFirstCardHigherValue,
    type StackLocation
} from "../../../../model/deck.model.ts";

// Rules about one player
const lastCard = (cards: Card[]) => cards[cards.length - 1];
const isStackEmpty = (cards: Card[]) => cards.length === 0;
const cardCount = (player: PlayerState) => player.remainingCards.length + player.wonCards.length;
const shouldRestack = (player: PlayerState) => isStackEmpty(player.remainingCards) && !isStackEmpty(player.wonCards);
const canPlay = (player: PlayerState) => player.canPlay && !shouldRestack(player);
const playedCard = (player: PlayerState) => lastCard(player.beingPlayedCards);

// Rules about one player against the other
const hasWonRound = (id: PlayerId) => (state: State) =>
    isFirstCardHigherValue(playedCard(state[id]), playedCard(state[opponentOf(id)]));
const hasWonGame = (id: PlayerId) => (state: State) =>
    cardCount(state[opponentOf(id)]) === 0 && cardCount(state[id]) > 0;

const isTiedGame = (state: State) => cardCount(state.player1) === 0 && cardCount(state.player2) === 0;
const hasGameEnded = (state: State) => state.gameEnded;

const isTopPairHidden = (state: State) => {
    const upStates = state.player1.beingPlayedCardsUpStates;
    return upStates.length > 0 && !upStates[upStates.length - 1];
};
const areCardsBeingPlayed = (state: State) => state.player1.beingPlayedCards.length > 0;

// Number of battles in the current round: each revealed pair of equal cards (at even indexes) is a battle.
// It is 0 when there is no battle or once the round has a winner.
const battleCount = (state: State) => {
    if (state.roundWinner !== null) return 0;
    const {player1, player2} = state;
    let count = 0;
    for (let i = 0; i < player1.beingPlayedCards.length && i < player2.beingPlayedCards.length; i += 2) {
        if (!player1.beingPlayedCardsUpStates[i] || !player2.beingPlayedCardsUpStates[i]) break;
        if (cardValue(player1.beingPlayedCards[i]) !== cardValue(player2.beingPlayedCards[i])) break;
        count++;
    }
    return count;
};

const haveBothPlayerPlayed = (state: State) =>
    state.player2.beingPlayedCards.length === state.player1.beingPlayedCards.length && areCardsBeingPlayed(state);
// cards at odd positions (1st, 3rd...) are shown, the ones in between are the hidden cards of a battle
const shouldCardsBeShown = (state: State) => haveBothPlayerPlayed(state) && state.player1.beingPlayedCards.length % 2 === 1;

// How each stack of a player is drawn on the table
const STACKS = [
    {name: "BeingPlayedCards", cards: (p: PlayerState) => p.beingPlayedCards, stackIndex: 3, messyLevel: 2, faceUp: (p: PlayerState, index: number) => p.beingPlayedCardsUpStates[index]},
    {name: "RemainingCards", cards: (p: PlayerState) => p.remainingCards, stackIndex: 1, messyLevel: 2, faceUp: () => false},
    {name: "WonCards", cards: (p: PlayerState) => p.wonCards, stackIndex: 2, messyLevel: 10, faceUp: () => true},
] as const;

const cardsWithLocation = (state: State): CardWithPlacement[] =>
    STACKS.flatMap(stack => PLAYERS.flatMap(id => {
        const player = state[id];
        const stackLocation: StackLocation = `${id}${stack.name}`;
        return stack.cards(player).map((card, index) => ({
            card,
            placement: {
                stackLocation,
                stackIndex: stack.stackIndex,
                index,
                faceUp: stack.faceUp(player, index),
                messyLevel: stack.messyLevel,
            }
        }));
    }));

const savedPlayer = ({remainingCards, wonCards, beingPlayedCards, beingPlayedCardsUpStates}: PlayerState): SavedBattlePlayer =>
    ({remainingCards, wonCards, beingPlayedCards, beingPlayedCardsUpStates});

export const selectors = {
    canPlayer1Play: (state: State) => canPlay(state.player1),
    canPlayer2Play: (state: State) => canPlay(state.player2),
    shouldCardsBeShown,
    haveBothPlayerPlayed,
    hasPlayer1WonRound: hasWonRound("player1"),
    hasPlayer2WonRound: hasWonRound("player2"),
    cardsWithLocation,
    shouldPlayer1RestackRemainingCards: (state: State) => shouldRestack(state.player1),
    shouldPlayer2RestackRemainingCards: (state: State) => shouldRestack(state.player2),
    hasPlayer1WonGame: hasWonGame("player1"),
    hasPlayer2WonGame: hasWonGame("player2"),
    isTiedGame,
    hasGameEnded,
    isTopPairHidden,
    areCardsBeingPlayed,
    battleCount,
    isPlayer2Computer: (state: State) => state.isPlayer2Computer,
    isRestored: (state: State) => state.isRestored,
    player1Name: (state: State) => state.playerNames[0] ?? null,
    player2Name: (state: State) => state.playerNames[1] ?? null,
    // the cards each player holds, those being played left aside
    player1CardCount: (state: State) => cardCount(state.player1),
    player2CardCount: (state: State) => cardCount(state.player2),
    lastRoundWinner: (state: State) => state.lastRoundWinner,
    savedGame: (state: State): SavedBattleGame => ({
        player1: savedPlayer(state.player1),
        player2: savedPlayer(state.player2),
        isPlayer2Computer: state.isPlayer2Computer,
        playerNames: state.playerNames,
        hasPlayed: state.hasPlayed,
        lastRoundWinner: state.lastRoundWinner,
    }),
    hasPlayed: (state: State) => state.hasPlayed,
} satisfies Selectors<State>;
export type Values = ExtractComponentValuesContract<typeof selectors>;
