import type {Card} from "../../../../model/deck.model.ts";
import {initialState, type State} from "./game.component.state.ts";
import {stateUpdaters} from "./game.component.updaters.ts";
import {selectors} from "./game.component.selectors.ts";
import {haveAllContendersPlayed, isGameOver, roundLeader} from "./game.component.rules.ts";

// The outcome of a Bataille game is fixed by the deal: the taps only set the pace.
// So a deal can be played to the end in memory, with the very rules of the table, before it is dealt.

// a game longer than this is not dealt, even if it would end; a whole deck between two players gets longer
export const MAX_ROUNDS = 1000;
export const MAX_ROUNDS_TWO_PLAYERS_FULL_DECK = 5000;
export const maxRounds = (cardCount: number, playerCount: number) =>
    playerCount === 2 && cardCount === 52 ? MAX_ROUNDS_TWO_PLAYERS_FULL_DECK : MAX_ROUNDS;

export type SimulatedGame = {
    // the game ends, comes back to a position it has already been in (and so never ends), or lasts too long
    outcome: "ends" | "loops" | "tooLong",
    rounds: number,
};

type UpdaterName = keyof typeof stateUpdaters;

// the piles are given from the bottom to the top, as they are dealt: the last card of each is played first
export const simulateGame = (piles: Card[][], maxRounds = MAX_ROUNDS): SimulatedGame => {
    let state: State = structuredClone(initialState);
    const apply = (name: UpdaterName, payload?: unknown) => {
        // an updater changes the state in place, or returns a new one
        const updater = stateUpdaters[name] as unknown as (params: { state: State, payload: unknown }) => unknown;
        const next = updater({state, payload});
        if (next) state = next as State;
    };
    // the piles of the players still in the game, at the start of a round
    const position = () => state.seats.map(seat => seat.rank === null ? seat.pile.join("") : "-").join("|");
    const seen = new Set<string>();

    apply("dealCompleted", {piles: piles.map(pile => [...pile]), setAsideCount: 0});
    // the updaters change the state in place, as on the table where each change is made on a copy:
    // the seats must not share their empty lists of cards
    state = JSON.parse(JSON.stringify(state)) as State;
    seen.add(position());
    for (; ;) {
        apply("readyForNextCards");
        if (isGameOver(state)) return {outcome: "ends", rounds: state.roundNumber - 1};
        let isRoundOver = false;
        if (selectors.isBattleWonByDefault(state)) {
            apply("roundWon");
            apply("cardsCollected");
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
                    apply("cardsCollected");
                    isRoundOver = true;
                }
            }
        }
        if (isRoundOver) {
            apply("roundCompleted");
            const rounds = state.roundNumber - 1;
            if (rounds > maxRounds) return {outcome: "tooLong", rounds};
            const current = position();
            if (seen.has(current)) return {outcome: "loops", rounds};
            seen.add(current);
        }
    }
};
