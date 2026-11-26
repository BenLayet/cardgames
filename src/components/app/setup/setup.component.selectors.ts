import type {ExtractComponentValuesContract, Selectors} from "@softer-components/types";

import {isSuitCountAvailable} from "../../../model/games.model.ts";
import type {State} from "./setup.component.state.ts";

const playerCount = (state: State) => state.seats.length;
export const selectors = {
    gameId: (state: State) => state.game.id,
    seats: (state: State) => state.seats,
    cardCount: (state: State) => state.cardCount,
    cardCountOptions: (state: State) => state.game.cardCountOptions,
    suitCount: (state: State) => state.suitCount,
    suitCountOptions: (state: State) => state.game.suitCountOptions,
    // what each option changes, null when the game does not say
    cardCountHints: (state: State) => state.game.cardCountOptions.map(option => state.game.cardCountHints?.[option] ?? null),
    suitCountHints: (state: State) => state.game.suitCountOptions.map(option => state.game.suitCountHints?.[option] ?? null),
    // whether each number of suits can be played with the chosen number of cards
    availableSuitCounts: (state: State) => state.game.suitCountOptions.map(option => isSuitCountAvailable(state.game, state.cardCount, option)),
    playerCount,
    // the name typed for each seat, "" when none was typed
    playerNames: (state: State) => state.seats.map((_, index) => state.playerNames[index] ?? ""),
    // the name shown for each seat during the game, null for a seat named after its number
    seatNames: (state: State) => state.seats.map((_, index) => state.playerNames[index]?.trim() || null),
    minPlayers: (state: State) => state.game.minPlayers,
    maxPlayers: (state: State) => state.game.maxPlayers,
    isPlayerCountFixed: (state: State) => state.game.minPlayers === state.game.maxPlayers,
    canAddPlayer: (state: State) => playerCount(state) < state.game.maxPlayers,
    canRemovePlayer: (state: State) => playerCount(state) > state.game.minPlayers,
    // whether each seat can switch between human and computer: the first seat is always a human
    changeableSeats: (state: State) => state.seats.map((_, index) => index > 0 && state.game.computerOpponents),
} satisfies Selectors<State>;
export type Values = ExtractComponentValuesContract<typeof selectors>;
