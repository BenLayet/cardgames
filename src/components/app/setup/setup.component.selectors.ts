import type {ExtractComponentValuesContract, Selectors} from "@softer-components/types";

import type {State} from "./setup.component.state.ts";

const playerCount = (state: State) => state.seats.length;
export const selectors = {
    gameId: (state: State) => state.game.id,
    seats: (state: State) => state.seats,
    cardCount: (state: State) => state.cardCount,
    cardCountOptions: (state: State) => state.game.cardCountOptions,
    suitCount: (state: State) => state.suitCount,
    suitCountOptions: (state: State) => state.game.suitCountOptions,
    playerCount,
    minPlayers: (state: State) => state.game.minPlayers,
    maxPlayers: (state: State) => state.game.maxPlayers,
    isPlayerCountFixed: (state: State) => state.game.minPlayers === state.game.maxPlayers,
    canAddPlayer: (state: State) => playerCount(state) < state.game.maxPlayers,
    canRemovePlayer: (state: State) => playerCount(state) > state.game.minPlayers,
    // whether each seat can switch between human and computer: the first seat is always a human
    changeableSeats: (state: State) => state.seats.map((_, index) => index > 0 && state.game.computerOpponents),
} satisfies Selectors<State>;
export type Values = ExtractComponentValuesContract<typeof selectors>;
