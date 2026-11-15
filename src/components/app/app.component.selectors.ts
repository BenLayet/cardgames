import type {
  ExtractComponentValuesContract,
  Selector,
  Selectors,
} from "@softer-components/types";
import { createBaseSelectors } from "@softer-components/utils";

import {type State, initialState } from "./app.component.state";
import type {Children} from "./app.component.contract.ts";

// the settings can only be changed from the home screen
const areSettingsAvailable: Selector<State, Children> = (_, childrenValues) => childrenValues.battle.values.isStartable();

export const selectors = {
  ...createBaseSelectors(initialState),
  areSettingsAvailable,
} satisfies Selectors<State, Children>;
export type Values = ExtractComponentValuesContract<typeof selectors>;
