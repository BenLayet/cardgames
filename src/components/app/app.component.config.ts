import type {ComponentDef} from "@softer-components/types";

import type {Contract} from "./app.component.contract";
import {uiEvents} from "./app.component.events";
import {childrenConfig} from "./app.component.forwarders";
import {selectors} from "./app.component.selectors";
import {type State, initialState} from "./app.component.state";
import {stateUpdaters} from "./app.component.updaters";

export const componentDef = (): ComponentDef<Contract, State> => {
    return {
        initialState,
        selectors,
        uiEvents,
        stateUpdaters,
        childrenConfig,
        childrenComponentDefs: {},
        initialChildren: {}
    };
};
