import type {ComponentDef} from "@softer-components/types";

import type {Contract} from "./start-screen.component.contract.ts";
import {uiEvents} from "./start-screen.component.events.ts";
import {selectors} from "./start-screen.component.selectors.ts";
import {type State, initialState} from "./start-screen.component.state.ts";
import {stateUpdaters} from "./start-screen.component.updaters.ts";

export const componentDef = (): ComponentDef<Contract, State> => {
    return {
        initialState,
        selectors,
        uiEvents,
        stateUpdaters,
    };
};
