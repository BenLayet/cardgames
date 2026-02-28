import type {ComponentDef} from "@softer-components/types";

import type {Contract} from "./game.component.contract.ts";
import {uiEvents} from "./game.component.events.ts";
import {eventForwarders} from "./game.component.forwarders.ts";
import {selectors} from "./game.component.selectors.ts";
import {type State, initialState} from "./game.component.state.ts";
import {stateUpdaters} from "./game.component.updaters.ts";
import {effects} from "./game.component.effects.ts";

export const componentDef = (): ComponentDef<Contract, State> => {
    return {
        initialState,
        selectors,
        uiEvents,
        stateUpdaters,
        eventForwarders,
        effects
    };
};
