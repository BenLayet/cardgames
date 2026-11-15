import type {ComponentDef} from "@softer-components/types";

import {type Contract, uiEvents} from "./start-screen.component.contract.ts";
import {selectors} from "./start-screen.component.selectors.ts";
import {type State, createInitialState} from "./start-screen.component.state.ts";
import {stateUpdaters} from "./start-screen.component.updaters.ts";
import {type Dependencies, effects} from "./start-screen.component.effects.ts";
import {View} from "./start-screen.component.view.tsx";

export type StartScreenDependencies = Dependencies;
export const startScreenDef = (dependencies: StartScreenDependencies): ComponentDef<Contract, State> => ({
    initialState: createInitialState(dependencies.settingsService.load()),
    selectors,
    uiEvents,
    stateUpdaters,
    config: {
        effects: effects(dependencies),
    },
});
export const StartScreen = View;
export type StartScreenContract = Contract;
