import type {
    ExtractComponentValuesContract,
    Selectors, Selector
} from "@softer-components/types";
import type {State} from "./battle.component.state";
import type {Children} from "./battle.component.contract.ts";

const isStarted = (state: State) => state.isStarted;
const isStartable = (state: State) => !state.isStarted;
const cardCount = ((_, childrenValues) => childrenValues.startScreen.values.cardCount()) satisfies Selector<State, Children>;
const shouldMenuBeVisible = isStarted;
export const selectors = {
    isStarted,
    cardCount,
    isStartable,
    shouldMenuBeVisible,
} satisfies Selectors<State, Children>;
export type Values = ExtractComponentValuesContract<typeof selectors>;
