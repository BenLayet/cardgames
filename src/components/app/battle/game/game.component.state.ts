import type {Card} from "../../../../model/deck.model.ts";
import type {BattleVariant} from "../../../../services/battle-save.service.ts";

// Bataille is played by 2 to 6 players, seated around the table: seat 0 at the bottom, the others clockwise
export const MAX_SEATS = 6;
// where the cards lie on a Bataille table: the deck, or a stack of a seat: its pile, or the cards it has played in the round
export type BattleStackLocation = "deck" | `seat${number}Pile` | `seat${number}Played`;
// in a game against the computer, the computer plays the second seat
export const COMPUTER_SEAT = 1;

export const initialSeatState = {
    // the pile of the player, from the bottom to the top: the top card is played first,
    // the cards won go under it
    pile: [] as Card[],
    // the cards laid in front of the player during the round, the first one at index 0
    played: [] as Card[],
    playedUp: [] as boolean[],
    canPlay: false,
    // the place of the player once they have no card left, 1 being the winner; null while they are in the game
    rank: null as number | null,
    // the round in which the player had no card left
    eliminatedRound: null as number | null,
};

export const initialState = {
    seats: [] as SeatState[],
    // the seats still fighting for the cards of the round: all the players at first, then the tied ones in a battle
    contenders: [] as number[],
    // what the next card of each contender is: a face up card, or the face down card of a battle
    step: "up" as "up" | "down",
    // number of ties in the current round
    battleCount: 0,
    // rounds played since the deal, the first one is round 1
    roundNumber: 1,
    roundWinner: null as number | null,
    // who won the last round, kept until the next one is won, to be said on the status line
    lastRoundWinner: null as number | null,
    // how many cards the last round winner took
    lastWonCount: 0,
    // the cards that no player can win any more: left out of the deal, or lost by every player of a battle
    setAsideCount: 0,
    gameEnded: false,
    // whether a card was played since the deal, the first one is announced on the status line
    hasPlayed: false,
    // one human against the computer, which plays the second seat; otherwise every seat is a human
    isSolo: true,
    // the names typed on the setup screen, null for a player named after their number
    playerNames: [] as (string | null)[],
    // a resumed game shows its cards where they are, without dealing them
    isRestored: false,
    // the cards collected in a round are shuffled from this seed and the round number, as when picked up by hand,
    // so that a deal can be played in memory before it is dealt; null: collected in seat order
    dealSeed: null as number | null,
    // the kind of game, under which it is saved: the players and the number of cards chosen on the menu
    variant: null as BattleVariant | null,
};

export type State = typeof initialState;
export type SeatState = typeof initialSeatState;
