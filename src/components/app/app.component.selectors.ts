import type {
  ExtractComponentValuesContract,
  Selectors,
} from "@softer-components/types";
import { createBaseSelectors } from "@softer-components/utils";

import {type State, initialState } from "./app.component.state";

export const selectors = {
  ...createBaseSelectors(initialState),
} satisfies Selectors<State>;
export type Values = ExtractComponentValuesContract<typeof selectors>;
