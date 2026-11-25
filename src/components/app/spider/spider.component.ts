import type {ComponentDef} from "@softer-components/types";

import {type Contract, uiEvents} from "./spider.component.contract";
import {eventForwarders} from "./spider.component.forwarders";
import {selectors} from "./spider.component.selectors";
import {type State, createInitialState} from "./spider.component.state";
import {stateUpdaters} from "./spider.component.updaters";
import {type Dependencies, effects} from "./spider.component.effects";
import {View} from "./spider.component.view";
import {gameDef, type GameDependencies} from "./game";
import {setupDef, type SetupDependencies} from "../setup";
import {gameDefinition} from "../../../model/games.model.ts";

export type SpiderDependencies = Dependencies & GameDependencies & SetupDependencies;
export const spiderDef = (dependencies: SpiderDependencies): ComponentDef<Contract, State> => ({
    initialState: createInitialState(dependencies.spiderSaveService.savedSuitCounts()),
    selectors,
    uiEvents,
    stateUpdaters,
    eventForwarders,
    config: {
        effects: effects(dependencies),
        childrenDefs: {
            game: gameDef(dependencies),
            setup: setupDef(gameDefinition("spider"), dependencies),
        },
    },
});
export const Spider = View;
export type SpiderContract = Contract;
