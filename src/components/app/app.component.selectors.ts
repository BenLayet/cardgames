import type {
  ExtractComponentValuesContract,
  Selectors,
} from "@softer-components/types";
import { createBaseSelectors } from "@softer-components/app-utilities";

import {type State, initialState } from "./app.component.state";
import type {Children} from "./app.component.contract.ts";

// the settings can only be changed from the home page
const areSettingsAvailable = (state: State) => state.page === "HOME";

export const selectors = {
  ...createBaseSelectors(initialState),
  areSettingsAvailable,
} satisfies Selectors<State, Children>;
export type Values = ExtractComponentValuesContract<typeof selectors>;
