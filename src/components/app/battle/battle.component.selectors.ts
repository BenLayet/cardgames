import type {
  ExtractComponentValuesContract,
  Selectors,
} from "@softer-components/types";
import { createBaseSelectors } from "@softer-components/utils";

import {type State, initialState } from "./battle.component.state";

const isStartable = (state:State) => !state.isStarted;
export const selectors = {
  ...createBaseSelectors(initialState),
    isStartable
} satisfies Selectors<State>;
export type Values = ExtractComponentValuesContract<typeof selectors>;
