import type {ExtractComponentValuesContract, Selectors} from "@softer-components/types";
import {createBaseSelectors} from "@softer-components/app-utilities";

import {type State, initialState} from "./settings.component.state.ts";

export const selectors = {
    ...createBaseSelectors(initialState),
} satisfies Selectors<State>;
export type Values = ExtractComponentValuesContract<typeof selectors>;
