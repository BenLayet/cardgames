import type {ComponentDef} from "@softer-components/types";

import {type Contract, uiEvents} from "./battle.component.contract";
import {childrenConfig} from "./battle.component.forwarders";
import {selectors} from "./battle.component.selectors";
import {type State, initialState} from "./battle.component.state";
import {stateUpdaters} from "./battle.component.updaters";
import {type Dependencies, effects} from "./battle.component.effects";
import {View} from "./battle.component.view";
import {gameDef, type GameDependencies} from "./game";
import {startScreenDef, type StartScreenDependencies} from "./start-screen";

export type BattleDependencies = Dependencies & GameDependencies & StartScreenDependencies;
export const battleDef = (dependencies: BattleDependencies): ComponentDef<Contract, State> => ({
    initialState,
    selectors,
    uiEvents,
    stateUpdaters,
    childrenConfig,
    effects: effects(dependencies),
    childrenComponentDefs: {
        game: gameDef(dependencies),
        startScreen: startScreenDef(dependencies),
    },
});
export const Battle = View;
export type BattleContract = Contract;
