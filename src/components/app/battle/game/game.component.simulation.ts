import type {Card} from "../../../../model/deck.model.ts";
import {initialState, type State} from "./game.component.state.ts";
import {stateUpdaters} from "./game.component.updaters.ts";
import {selectors} from "./game.component.selectors.ts";
import {areCardsOnTable, haveAllContendersPlayed, isGameOver, isTopLayerHidden, roundLeader} from "./game.component.rules.ts";

// The outcome of a Bataille game is fixed by the deal: the taps only set the pace.
// So a deal can be played to the end in memory, with the very rules of the table, before it is dealt.

// Only a game that never ends is not dealt, however long it lasts.
// Collected in seat order, a game that comes back to a position it has already been in loops forever.
// Shuffled, the cards collected in each round are mixed differently, so no position comes back for sure:
// a game that has not ended after this many rounds is taken as never ending. On 1,000 deals of 52 cards
// for 2, 3 and 6 players, the longest game lasted 3,979 rounds.
export const NEVER_ENDING_ROUNDS = 20_000;

export type SimulatedGame = {
    // the game ends, or never does
    outcome: "ends" | "neverEnds",
    rounds: number,
};

type UpdaterName = keyof typeof stateUpdaters;

// the piles of the players between two rounds, the cards on the table included
const position = (state: State) => state.seats.map(seat => `${seat.pile.join("")}|${seat.played.join("")}`).join("/");

// the piles are given from the bottom to the top, as they are dealt: the last card of each is played first;
// the seed shuffles the cards collected, as on the table (null: collected in seat order)
export const simulateGame = (piles: Card[][], dealSeed: number | null, maxRounds = NEVER_ENDING_ROUNDS): SimulatedGame => {
    let state: State = structuredClone(initialState);
    // the positions seen at the start of a round, when the cards are collected in seat order
    const positions = new Set<string>();
    const apply = (name: UpdaterName, payload?: unknown) => {
        // an updater changes the state in place, or returns a new one
        const updater = stateUpdaters[name] as unknown as (params: { state: State, payload: unknown }) => unknown;
        const next = updater({state, payload});
        if (next) state = next as State;
    };
    // the players tap until every layer is collected
    const collect = () => {
        while (areCardsOnTable(state)) {
            if (isTopLayerHidden(state)) apply("hiddenCardsRevealed");
            apply("layerCollected");
        }
    };
    apply("dealCompleted", {piles: piles.map(pile => [...pile]), setAsideCount: 0, dealSeed: dealSeed ?? undefined});
    // the updaters change the state in place, as on the table where each change is made on a copy:
    // the seats must not share their empty lists of cards
    state = JSON.parse(JSON.stringify(state)) as State;
    for (; ;) {
        apply("readyForNextCards");
        if (isGameOver(state)) return {outcome: "ends", rounds: state.roundNumber - 1};
        let isRoundOver = false;
        if (selectors.isBattleWonByDefault(state)) {
            apply("roundWon");
            collect();
            isRoundOver = true;
        } else if (selectors.isBattleLostByAll(state)) {
            apply("cardsSetAside");
            isRoundOver = true;
        } else {
            state.seats.forEach((seat, index) => {
                if (seat.canPlay) apply("playerPlayed", index);
            });
            if (!haveAllContendersPlayed(state)) throw new Error("Every contender has played in a simulated round");
            if (state.step === "down") {
                apply("stepCompleted");
            } else {
                apply("suspenseCompleted");
                if (roundLeader(state) === null) {
                    apply("tieOccurred");
                } else {
                    apply("roundWon");
                    collect();
                    isRoundOver = true;
                }
            }
        }
        if (isRoundOver) {
            apply("roundCompleted");
            const rounds = state.roundNumber - 1;
            if (rounds > maxRounds) return {outcome: "neverEnds", rounds};
            if (dealSeed === null) {
                const seen = position(state);
                if (positions.has(seen)) return {outcome: "neverEnds", rounds};
                positions.add(seen);
            }
        }
    }
};
