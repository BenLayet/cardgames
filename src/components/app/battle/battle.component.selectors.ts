import type {
  ExtractComponentValuesContract,
  Selectors,
} from "@softer-components/types";
import {createBaseSelectors, not} from "@softer-components/utils";

import {type State, initialState } from "./battle.component.state";

const isStartable = (state:State) => !state.isStarted;
const shouldMenuBeVisible = not(isStartable);
export const selectors = {
  ...createBaseSelectors(initialState),
    isStartable,
    shouldMenuBeVisible
} satisfies Selectors<State>;
export type Values = ExtractComponentValuesContract<typeof selectors>;
