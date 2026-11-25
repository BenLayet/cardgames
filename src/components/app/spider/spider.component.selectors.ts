import type {ExtractComponentValuesContract, Selector, Selectors} from "@softer-components/types";

import type {State} from "./spider.component.state";
import type {Children} from "./spider.component.contract.ts";

const isStarted = (state: State) => state.isStarted;
const isStartable = (state: State) => !state.isStarted;
const canResume = (state: State) => !state.isStarted && state.hasSavedGame;
const suitCount = ((_, childrenValues) => childrenValues.setup.values.suitCount()) satisfies Selector<State, Children>;
export const selectors = {
    isStarted,
    isStartable,
    canResume,
    suitCount,
} satisfies Selectors<State, Children>;
export type Values = ExtractComponentValuesContract<typeof selectors>;
