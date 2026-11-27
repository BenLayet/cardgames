import type {ExtractComponentValuesContract, Selectors} from "@softer-components/types";

import {isCardCountAvailable, isSuitCountAvailable} from "../../../model/games.model.ts";
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
    // the players are chosen as one human against the computer, or a number of humans
    isSoloOrHumans: (state: State) => state.game.soloOrHumans ?? false,
    isSolo: (state: State) => state.seats.includes("computer"),
    // the choices of players: 1 for one human against the computer, then 2 humans and more
    humanCountOptions: (state: State) => Array.from({length: state.game.maxPlayers}, (_, i) => i + 1),
    humanCount: (state: State) => state.seats.filter(seat => seat === "human").length,
    // whether each number of cards gives enough cards to each player
    availableCardCounts: (state: State) => state.game.cardCountOptions.map(option => isCardCountAvailable(state.game, option, playerCount(state))),
    cardsPerPlayer: (state: State) => Math.floor(state.cardCount / playerCount(state)),
    setAsideCount: (state: State) => state.cardCount % playerCount(state),
    // the name typed for each seat, "" when none was typed
    playerNames: (state: State) => state.seats.map((_, index) => state.playerNames[index] ?? ""),
    // the name shown for each seat during the game, null for a seat named after its number
    seatNames: (state: State) => state.seats.map((_, index) => state.playerNames[index]?.trim() || null),
} satisfies Selectors<State>;
export type Values = ExtractComponentValuesContract<typeof selectors>;
