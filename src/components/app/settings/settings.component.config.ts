import type {ComponentDef} from "@softer-components/types";

import type {Contract} from "./settings.component.contract.ts";
import {uiEvents} from "./settings.component.events.ts";
import {selectors} from "./settings.component.selectors.ts";
import {type State, createInitialState} from "./settings.component.state.ts";
import {stateUpdaters} from "./settings.component.updaters.ts";
import {type Dependencies, effects} from "./settings.component.effects.ts";

export type {Dependencies};
export const componentDef = (dependencies: Dependencies): ComponentDef<Contract, State> => {
    return {
        initialState: createInitialState(dependencies.settingsService.load()),
        selectors,
        uiEvents,
        stateUpdaters,
        effects: effects(dependencies),
    };
};
