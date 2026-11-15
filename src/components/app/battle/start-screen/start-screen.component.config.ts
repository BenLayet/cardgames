import type {ComponentDef} from "@softer-components/types";

import type {Contract} from "./start-screen.component.contract.ts";
import {uiEvents} from "./start-screen.component.events.ts";
import {selectors} from "./start-screen.component.selectors.ts";
import {type State, createInitialState} from "./start-screen.component.state.ts";
import {stateUpdaters} from "./start-screen.component.updaters.ts";
import {type Dependencies, effects} from "./start-screen.component.effects.ts";

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
