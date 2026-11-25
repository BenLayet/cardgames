import type {
  ExtractComponentValuesContract,
  Selectors,
} from "@softer-components/types";
import { createBaseSelectors } from "@softer-components/app-utilities";

import {type State, initialState } from "./app.component.state";
import type {Children} from "./app.component.contract.ts";

export const selectors = {
  ...createBaseSelectors(initialState),
} satisfies Selectors<State, Children>;
export type Values = ExtractComponentValuesContract<typeof selectors>;
