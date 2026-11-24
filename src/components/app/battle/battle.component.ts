import type {ComponentDef} from "@softer-components/types";

import {type Contract, uiEvents} from "./battle.component.contract";
import {eventForwarders} from "./battle.component.forwarders";
import {selectors} from "./battle.component.selectors";
import {type State, initialState} from "./battle.component.state";
import {stateUpdaters} from "./battle.component.updaters";
import {type Dependencies, effects} from "./battle.component.effects";
import {View} from "./battle.component.view";
import {gameDef, type GameDependencies} from "./game";
import {setupDef, type SetupDependencies} from "../setup";
import {gameDefinition} from "../../../model/games.model.ts";

export type BattleDependencies = Dependencies & GameDependencies & SetupDependencies;
export const battleDef = (dependencies: BattleDependencies): ComponentDef<Contract, State> => ({
    initialState,
    selectors,
    uiEvents,
    stateUpdaters,
    eventForwarders,
    config: {
        effects: effects(dependencies),
        childrenDefs: {
            game: gameDef(dependencies),
            setup: setupDef(gameDefinition("bataille"), dependencies),
        },
    },
});
export const Battle = View;
export type BattleContract = Contract;
