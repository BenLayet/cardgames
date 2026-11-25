import type {
    ExtractComponentValuesContract,
    Selectors, Selector
} from "@softer-components/types";
import type {State} from "./battle.component.state";
import type {Children} from "./battle.component.contract.ts";

const isStarted = (state: State) => state.isStarted;
const isStartable = (state: State) => !state.isStarted;
const cardCount = ((_, childrenValues) => childrenValues.setup.values.cardCount()) satisfies Selector<State, Children>;
const isPlayer2Computer = ((_, childrenValues) => childrenValues.setup.values.seats()[1] === "computer") satisfies Selector<State, Children>;
const playerNames = ((_, childrenValues) => childrenValues.setup.values.seatNames()) satisfies Selector<State, Children>;
const shouldMenuBeVisible = isStarted;
export const selectors = {
    isStarted,
    cardCount,
    isPlayer2Computer,
    playerNames,
    isStartable,
    shouldMenuBeVisible,
} satisfies Selectors<State, Children>;
export type Values = ExtractComponentValuesContract<typeof selectors>;
