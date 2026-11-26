import type {StateUpdaters} from "@softer-components/types";

import type {Contract} from "./game.component.contract.ts";
import {initialPlayerState, initialState, opponentOf, PLAYERS, type PlayerState, type State} from "./game.component.state.ts";
import {assertIsNotUndefined} from "../../../../utils/assert.functions.ts";

// The helpers below change the state in place and return nothing,
// because a value returned by an updater would replace the whole state.
const playTopCard = (player: PlayerState): void => {
    const card = player.remainingCards.pop();
    assertIsNotUndefined(card);
    player.beingPlayedCards.push(card);
    player.beingPlayedCardsUpStates.push(false);
    player.canPlay = false;
};
const revealTopCards = (state: State): void => {
    PLAYERS.forEach(id => {
        const upStates = state[id].beingPlayedCardsUpStates;
        upStates[upStates.length - 1] = true;
    });
};
const restack = (player: PlayerState): void => {
    player.remainingCards = [...player.remainingCards, ...player.wonCards];
    player.wonCards = [];
};

export const stateUpdaters: StateUpdaters<Contract, State> = {
    dealRequested: ({payload: {isPlayer2Computer, playerNames}}) => ({...initialState, isPlayer2Computer, playerNames}),
    dealCompleted: ({state, payload}) => {
        state.player1.remainingCards = payload.player1Cards;
        state.player2.remainingCards = payload.player2Cards;
    },
    gameRestored: ({payload}) => ({
        ...initialState,
        ...payload,
        player1: {...initialPlayerState, ...payload.player1},
        player2: {...initialPlayerState, ...payload.player2},
    }),
    player1Played: ({state}) => {
        playTopCard(state.player1);
        state.hasPlayed = true;
    },
    player2Played: ({state}) => playTopCard(state.player2),
    readyForNextCards: ({state}) => {
        PLAYERS.forEach(id => {
            state[id].canPlay = true;
        });
    },
    suspenseCompleted: ({state}) => revealTopCards(state),
    player1WonRound: ({state}) => {
        state.roundWinner = "player1";
        state.lastRoundWinner = "player1";
    },
    player2WonRound: ({state}) => {
        state.roundWinner = "player2";
        state.lastRoundWinner = "player2";
    },
    // The played cards go to the round winner pair by pair, starting from the top of the stacks
    hiddenPairRevealed: ({state}) => revealTopCards(state),
    pairTransferred: ({state}) => {
        const winner = state.roundWinner;
        if (winner === null) throw new Error("A pair can only be transferred once the round has a winner");
        const loser = opponentOf(winner);
        const winnerCard = state[winner].beingPlayedCards.pop();
        const loserCard = state[loser].beingPlayedCards.pop();
        assertIsNotUndefined(winnerCard);
        assertIsNotUndefined(loserCard);
        state[winner].beingPlayedCardsUpStates.pop();
        state[loser].beingPlayedCardsUpStates.pop();
        state[winner].wonCards.push(loserCard, winnerCard);
    },
    roundCompleted: ({state}) => {
        state.roundWinner = null;
    },
    player1RestackedRemainingCards: ({state}) => restack(state.player1),
    player2RestackedRemainingCards: ({state}) => restack(state.player2),
    gameEnded: ({state}) => {
        state.gameEnded = true;
    },
    playAgainRequested: ({state}) => ({...initialState, isPlayer2Computer: state.isPlayer2Computer}),
};
