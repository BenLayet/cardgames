import type {StateUpdaters} from "@softer-components/types";

import type {Contract} from "./game.component.contract.ts";
import {initialSeatState, initialState, type SeatState, type State} from "./game.component.state.ts";
import {gameWinner, highestContenders, isInGame, mustPlay, roundLeader, seatsInGame} from "./game.component.rules.ts";
import type {Card} from "../../../../model/deck.model.ts";
import {assertIsNotUndefined} from "../../../../utils/assert.functions.ts";

// The helpers below change the state in place and return nothing,
// because a value returned by an updater would replace the whole state.
// a card is laid face up, at once, except the face down card of a battle
const playTopCard = (seat: SeatState, faceUp: boolean): void => {
    const card = seat.pile.pop();
    assertIsNotUndefined(card);
    seat.played.push(card);
    seat.playedUp.push(faceUp);
    seat.canPlay = false;
};
// the last card of each contender is face up (it already is, unless the game was saved by an older version)
const revealTopCards = (state: State): void => {
    state.contenders.forEach(index => {
        const upStates = state.seats[index].playedUp;
        if (upStates.length > 0) upStates[upStates.length - 1] = true;
    });
};
// the players left without any card leave the game, once the cards of the round they lost have been collected;
// those who leave in the same round share their place
const eliminatePlayers = (state: State): void => {
    const out = state.seats.filter(seat => isInGame(seat) && seat.pile.length === 0 && seat.played.length === 0);
    if (out.length === 0) return;
    const rank = seatsInGame(state).length - out.length + 1;
    out.forEach(seat => {
        seat.rank = rank;
        seat.eliminatedRound = state.roundNumber - 1;
    });
};
const newSeats = (piles: Card[][]): SeatState[] =>
    piles.map(pile => ({...initialSeatState, pile}));
const startRound = (state: State): void => {
    state.roundWinner = null;
    state.battleCount = 0;
    state.step = "up";
    state.contenders = seatsInGame(state);
};

export const stateUpdaters: StateUpdaters<Contract, State> = {
    dealRequested: ({payload: {isSolo, playerNames}}) => ({...initialState, isSolo, playerNames}),
    dealCompleted: ({state, payload: {piles, setAsideCount}}) => {
        state.seats = newSeats(piles);
        state.setAsideCount = setAsideCount;
        startRound(state);
    },
    gameRestored: ({payload}) => ({
        ...initialState,
        ...payload,
        seats: payload.seats.map(seat => ({...initialSeatState, ...seat, canPlay: false})),
        isRestored: true,
    }),
    playerPlayed: ({state, payload: index}) => {
        playTopCard(state.seats[index], state.step === "up");
        state.hasPlayed = true;
    },
    // the players without cards leave the game, then each contender who has to lay a card can play it
    readyForNextCards: ({state}) => {
        eliminatePlayers(state);
        state.contenders = state.contenders.filter(index => isInGame(state.seats[index]));
        // in a battle, a contender without any card loses it
        if (state.step === "down") state.contenders = state.contenders.filter(index => state.seats[index].pile.length > 0);
        state.seats.forEach((seat, index) => {
            seat.canPlay = mustPlay(state, index);
        });
    },
    // after the face down cards of a battle come the face up ones
    stepCompleted: ({state}) => {
        state.step = "up";
    },
    suspenseCompleted: ({state}) => revealTopCards(state),
    // only the players tied on the highest card play the battle
    tieOccurred: ({state}) => {
        state.contenders = highestContenders(state);
        state.step = "down";
        state.battleCount++;
    },
    // the highest card wins, or the last contender left in a battle
    roundWon: ({state}) => {
        const winner = state.contenders.length === 1 ? state.contenders[0] : roundLeader(state);
        if (winner === null) throw new Error("A round can only be won by a single player");
        state.roundWinner = winner;
        state.lastRoundWinner = winner;
        state.lastWonCount = state.seats.reduce((count, seat) => count + seat.played.length, 0);
    },
    // the face down cards are shown before they go to the winner
    hiddenCardsRevealed: ({state}) => {
        state.seats.forEach(seat => {
            seat.playedUp = seat.playedUp.map(() => true);
        });
    },
    // every card of the round goes under the pile of the winner
    cardsCollected: ({state}) => {
        const winner = state.roundWinner;
        if (winner === null) throw new Error("The cards can only be collected once the round has a winner");
        const won = state.seats.flatMap(seat => seat.played);
        state.seats.forEach(seat => {
            seat.played = [];
            seat.playedUp = [];
        });
        state.seats[winner].pile = [...won, ...state.seats[winner].pile];
    },
    // no player of the battle has a card left: nobody can win the cards of the round
    cardsSetAside: ({state}) => {
        state.setAsideCount += state.seats.reduce((count, seat) => count + seat.played.length, 0);
        state.seats.forEach(seat => {
            seat.played = [];
            seat.playedUp = [];
        });
    },
    roundCompleted: ({state}) => {
        state.roundNumber++;
        startRound(state);
    },
    gameWon: ({state}) => {
        const winner = gameWinner(state);
        if (winner !== null) state.seats[winner].rank = 1;
    },
    gameEnded: ({state}) => {
        state.gameEnded = true;
        state.seats.forEach(seat => {
            seat.canPlay = false;
        });
    },
    playAgainRequested: ({state}) => ({...initialState, isSolo: state.isSolo, playerNames: state.playerNames}),
};
