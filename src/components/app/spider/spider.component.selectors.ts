import type {ExtractComponentValuesContract, Selector, Selectors} from "@softer-components/types";

import type {State} from "./spider.component.state";
import type {Children} from "./spider.component.contract.ts";
import {sameVariant, type SpiderVariant} from "../../../model/spider.model.ts";

const isStarted = (state: State) => state.isStarted;
const isStartable = (state: State) => !state.isStarted;
const variant = ((_, childrenValues): SpiderVariant => ({
    suitCount: childrenValues.setup.values.suitCount(),
    cardCount: childrenValues.setup.values.cardCount(),
})) satisfies Selector<State, Children>;
// only the game of the chosen numbers of suits and cards can be resumed
const canResume = ((state: State, childrenValues) => !state.isStarted
    && state.savedVariants.some(saved => sameVariant(saved, variant(state, childrenValues)))) satisfies Selector<State, Children>;
export const selectors = {
    isStarted,
    isStartable,
    canResume,
    variant,
} satisfies Selectors<State, Children>;
export type Values = ExtractComponentValuesContract<typeof selectors>;
