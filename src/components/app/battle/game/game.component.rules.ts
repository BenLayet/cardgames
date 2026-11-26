import {type Card, cardValue} from "../../../../model/deck.model.ts";
import type {SeatState, State} from "./game.component.state.ts";

// The rules of Bataille, read from the state of a game

const top = (cards: Card[]) => cards[cards.length - 1];
// the cards a player holds, those on the table left aside
export const cardCount = (seat: SeatState) => seat.pile.length;
export const isInGame = (seat: SeatState) => seat.rank === null;
export const seatsInGame = (state: State) => state.seats.flatMap((seat, index) => isInGame(seat) ? [index] : []);
export const areCardsOnTable = (state: State) => state.seats.some(seat => seat.played.length > 0);
// The cards played in a round lie in layers: the first card of each player, then the face down cards of a battle,
// then its face up cards… The top layer is the deepest one still on the table: the cards laid last
export const topLayerDepth = (state: State) => Math.max(0, ...state.seats.map(seat => seat.played.length));
export const isTopLayerHidden = (state: State) => {
    const depth = topLayerDepth(state);
    return depth > 0 && state.seats.some(seat => seat.playedUp.length === depth && !seat.playedUp[depth - 1]);
};

// a player with a single card left in a battle plays it face up, without a face down card before it
export const mustPlay = (state: State, index: number) => {
    const seat = state.seats[index];
    if (state.gameEnded || isGameOver(state) || state.roundWinner !== null || !state.contenders.includes(index) || !isInGame(seat)) return false;
    return state.step === "up" ? seat.pile.length >= 1 : seat.pile.length >= 2;
};

export const haveAllContendersPlayed = (state: State) =>
    state.contenders.length >= 2 && state.roundWinner === null && !state.gameEnded
    && state.contenders.every(index => !state.seats[index].canPlay);

// the contenders whose face up card is the highest of the round
export const highestContenders = (state: State): number[] => {
    const values = state.contenders.map(index => cardValue(top(state.seats[index].played)));
    const highest = Math.max(...values);
    return state.contenders.filter((_, i) => values[i] === highest);
};

// the round winner once the face up cards are turned over, null on a tie
export const roundLeader = (state: State): number | null => {
    const highest = highestContenders(state);
    return highest.length === 1 ? highest[0] : null;
};

// the game is over once a single player, or none, holds cards
export const isGameOver = (state: State) => !areCardsOnTable(state) && seatsInGame(state).length <= 1;
export const gameWinner = (state: State): number | null => {
    if (!isGameOver(state)) return null;
    const left = seatsInGame(state);
    return left.length === 1 ? left[0] : null;
};
