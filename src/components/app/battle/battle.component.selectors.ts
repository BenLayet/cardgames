import type {
    ExtractComponentValuesContract,
    Selectors, Selector
} from "@softer-components/types";
import type {State} from "./battle.component.state";
import type {Children} from "./battle.component.children.ts";

const isStarted = (state: State) => state.isStarted;
const isStartable = (state: State) => !state.isStarted;
const cardCount: Selector<State, Children> = (_, childrenValues) => childrenValues.startScreen.values.cardCount();
const shouldMenuBeVisible = isStarted;
export const selectors = {
    isStarted,
    cardCount,
    isStartable,
    shouldMenuBeVisible,
} satisfies Selectors<State, Children>;
export type Values = ExtractComponentValuesContract<typeof selectors>;
