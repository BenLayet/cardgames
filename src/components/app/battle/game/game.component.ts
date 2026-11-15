import type {ComponentDef} from "@softer-components/types";

import {type Contract, uiEvents} from "./game.component.contract.ts";
import {eventForwarders} from "./game.component.forwarders.ts";
import {selectors} from "./game.component.selectors.ts";
import {type State, initialState} from "./game.component.state.ts";
import {stateUpdaters} from "./game.component.updaters.ts";
import {type Dependencies, effects} from "./game.component.effects.ts";
import {View} from "./game.component.view.tsx";

export type GameDependencies = Dependencies;
export const gameDef = (dependencies: GameDependencies): ComponentDef<Contract, State> => ({
    initialState,
    selectors,
    uiEvents,
    stateUpdaters,
    eventForwarders,
    effects: effects(dependencies),
});
export const Game = View;
export type GameContract = Contract;
