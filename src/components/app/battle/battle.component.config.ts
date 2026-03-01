import type {ComponentDef} from "@softer-components/types";

import type {Contract} from "./battle.component.contract";
import {uiEvents} from "./battle.component.events";
import {childrenConfig} from "./battle.component.forwarders";
import {selectors} from "./battle.component.selectors";
import {type State, initialState} from "./battle.component.state";
import {stateUpdaters} from "./battle.component.updaters";
import {gameDef, type GameDependencies} from "./game";

export type  Dependencies = GameDependencies;
export const componentDef = (dependencies: Dependencies): ComponentDef<Contract, State> => {
    return {
        initialState,
        selectors,
        uiEvents,
        stateUpdaters,
        childrenConfig,
        childrenComponentDefs: {
            game: gameDef(dependencies)
        },
    };
};
