import type {
    ExtractComponentValuesContract,
    Selectors, Selector
} from "@softer-components/types";
import type {State} from "./battle.component.state";
import type {Children} from "./battle.component.contract.ts";

const isStarted = (state: State) => state.isStarted;
const isStartable = (state: State) => !state.isStarted;
const cardCount = ((_, childrenValues) => childrenValues.setup.values.cardCount()) satisfies Selector<State, Children>;
// one human against the computer, or only humans
const isSolo = ((_, childrenValues) => childrenValues.setup.values.seats().includes("computer")) satisfies Selector<State, Children>;
const playerCount = ((_, childrenValues) => childrenValues.setup.values.seats().length) satisfies Selector<State, Children>;
const playerNames = ((_, childrenValues) => childrenValues.setup.values.seatNames()) satisfies Selector<State, Children>;
const shouldMenuBeVisible = isStarted;
const canResume = (state: State) => !state.isStarted && state.hasSavedGame;
export const selectors = {
    isStarted,
    cardCount,
    isSolo,
    playerCount,
    playerNames,
    isStartable,
    shouldMenuBeVisible,
    canResume,
} satisfies Selectors<State, Children>;
export type Values = ExtractComponentValuesContract<typeof selectors>;
