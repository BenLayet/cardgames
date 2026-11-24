import type {ComponentDef} from "@softer-components/types";

import {type Contract, uiEvents} from "./setup.component.contract.ts";
import {selectors} from "./setup.component.selectors.ts";
import {type State, createInitialState} from "./setup.component.state.ts";
import {stateUpdaters} from "./setup.component.updaters.ts";
import {type Dependencies, effects} from "./setup.component.effects.ts";
import {View} from "./setup.component.view.tsx";
import type {GameDefinition} from "../../../model/games.model.ts";

export type SetupDependencies = Dependencies;
// The same setup screen serves every game: the game definition says what can be chosen
export const setupDef = (game: GameDefinition, dependencies: SetupDependencies): ComponentDef<Contract, State> => ({
    initialState: createInitialState(game, dependencies.settingsService.load()),
    selectors,
    uiEvents,
    stateUpdaters,
    config: {
        effects: effects(dependencies),
    },
});
export const Setup = View;
export type SetupContract = Contract;
