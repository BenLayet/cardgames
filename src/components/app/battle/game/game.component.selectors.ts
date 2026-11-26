import type {SavedBattleGame} from "../../../../services/battle-save.service.ts";
import type {ExtractComponentValuesContract, Selectors} from "@softer-components/types";

import type {State} from "./game.component.state.ts";
import type {CardWithPlacement} from "../../../../model/deck.model.ts";
import {PILE_TILT_DEG, PLAYED_TILT_DEG} from "./game.component.layout.ts";
import {
    areCardsOnTable,
    cardCount,
    gameWinner,
    haveAllContendersPlayed,
    isGameOver,
    isInGame,
    isTopLayerHidden,
    roundLeader,
} from "./game.component.rules.ts";

// a battle is going on: more than one player is tied, and the round has no winner yet
const isBattleGoingOn = (state: State) => state.battleCount > 0 && state.roundWinner === null;

// the round is won and its cards are still on the table
const isWaitingForCollection = (state: State) => state.roundWinner !== null && areCardsOnTable(state) && !state.gameEnded;

// a messy level is the full range of the tilt, from one side to the other
const PILE_MESSY_LEVEL = 2 * PILE_TILT_DEG;
const PLAYED_MESSY_LEVEL = 2 * PLAYED_TILT_DEG;

// How each stack of a seat is drawn on the table: the cards played lie over the piles
const cardsWithLocation = (state: State): CardWithPlacement[] =>
    state.seats.flatMap((seat, seatIndex) => [
        ...seat.pile.map((card, index) => ({
            card,
            placement: {stackLocation: `seat${seatIndex}Pile` as const, stackIndex: 1, index, faceUp: false, messyLevel: PILE_MESSY_LEVEL},
        })),
        ...seat.played.map((card, index) => ({
            card,
            // the cards of a battle are piled on each other
            placement: {stackLocation: `seat${seatIndex}Played` as const, stackIndex: 3, index, faceUp: seat.playedUp[index], messyLevel: PLAYED_MESSY_LEVEL},
        })),
    ]);

const savedGame = (state: State): SavedBattleGame => ({
    seats: state.seats.map(({pile, played, playedUp, rank, eliminatedRound}) => ({pile, played, playedUp, rank, eliminatedRound})),
    contenders: state.contenders,
    step: state.step,
    battleCount: state.battleCount,
    roundNumber: state.roundNumber,
    lastRoundWinner: state.lastRoundWinner,
    lastWonCount: state.lastWonCount,
    setAsideCount: state.setAsideCount,
    hasPlayed: state.hasPlayed,
    isSolo: state.isSolo,
    playerNames: state.playerNames,
    dealSeed: state.dealSeed,
});

// what each seat shows on the table
export type SeatView = {
    name: string | null,
    cardCount: number,
    canPlay: boolean,
    isComputer: boolean,
    // tied on the highest card, in the battle
    isTied: boolean,
    // waiting, out of the battle: their cards stay on the table and go to the winner
    isDimmed: boolean,
    isRoundWinner: boolean,
    rank: number | null,
    eliminatedRound: number | null,
};
const seatViews = (state: State): SeatView[] => state.seats.map((seat, index) => ({
    name: state.isSolo ? null : state.playerNames[index] ?? null,
    cardCount: cardCount(seat),
    canPlay: seat.canPlay,
    isComputer: state.isSolo && index === 1,
    isTied: isBattleGoingOn(state) && state.contenders.includes(index),
    isDimmed: isBattleGoingOn(state) && isInGame(seat) && !state.contenders.includes(index),
    isRoundWinner: state.roundWinner === index,
    rank: seat.rank,
    eliminatedRound: seat.eliminatedRound,
}));

export const selectors = {
    seatCount: (state: State) => state.seats.length,
    seats: seatViews,
    canPlay: (state: State) => state.seats.map(seat => seat.canPlay),
    haveAllPlayed: haveAllContendersPlayed,
    // the cards are turned over once every contender has laid a face up card
    shouldCardsBeShown: (state: State) => haveAllContendersPlayed(state) && state.step === "up",
    // after the face down cards of a battle, nothing is shown: the face up cards come next
    isFaceDownStep: (state: State) => state.step === "down",
    hasRoundLeader: (state: State) => roundLeader(state) !== null,
    // the other players of a battle have no card left
    isBattleWonByDefault: (state: State) => state.step === "down" && state.contenders.length === 1 && state.roundWinner === null && areCardsOnTable(state),
    // no player of a battle has a card left
    isBattleLostByAll: (state: State) => state.step === "down" && state.contenders.length === 0 && areCardsOnTable(state),
    // the round is won: the players send the cards to the winner layer by layer, turning over a face down layer first
    canRevealHiddenCards: (state: State) => isWaitingForCollection(state) && isTopLayerHidden(state),
    canCollectCards: (state: State) => isWaitingForCollection(state) && !isTopLayerHidden(state),
    isGameOver,
    hasGameWinner: (state: State) => gameWinner(state) !== null,
    // the seat of the winner once the game has ended, null on a tie
    gameWinner: (state: State) => {
        const winners = state.seats.flatMap((seat, index) => seat.rank === 1 ? [index] : []);
        return state.gameEnded && winners.length === 1 ? winners[0] : null;
    },
    isTiedGame: (state: State) => state.gameEnded && state.seats.filter(seat => seat.rank === 1).length !== 1,
    // the seats from the first place to the last, those sharing a place in the order of the table
    ranking: (state: State) => state.seats.map((_, index) => index)
        .sort((a, b) => (state.seats[a].rank ?? 0) - (state.seats[b].rank ?? 0) || a - b),
    hasGameEnded: (state: State) => state.gameEnded,
    battleCount: (state: State) => isBattleGoingOn(state) ? state.battleCount : 0,
    cardsWithLocation,
    isSolo: (state: State) => state.isSolo,
    isRestored: (state: State) => state.isRestored,
    playerNames: (state: State) => state.playerNames,
    roundWinner: (state: State) => state.roundWinner,
    lastRoundWinner: (state: State) => state.lastRoundWinner,
    lastWonCount: (state: State) => state.lastWonCount,
    roundNumber: (state: State) => state.roundNumber,
    areCardsOnTable,
    hasPlayed: (state: State) => state.hasPlayed,
    savedGame,
    variant: (state: State) => state.variant,
} satisfies Selectors<State>;
export type Values = ExtractComponentValuesContract<typeof selectors>;
