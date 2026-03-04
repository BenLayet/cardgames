import type {
  ExtractComponentValuesContract,
  Selectors,
} from "@softer-components/types";
import {createBaseSelectors} from "@softer-components/utils";

import {type State, initialState } from "./start-screen.component.state.ts";

const canIncrementCardCount = (state:State) => state.cardCount < 52;
const canDecrementCardCount = (state:State) => state.cardCount > 4;
export const selectors = {
  ...createBaseSelectors(initialState),
    canIncrementCardCount,
    canDecrementCardCount
} satisfies Selectors<State>;
export type Values = ExtractComponentValuesContract<typeof selectors>;
