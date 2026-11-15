import type {ComponentDef} from "@softer-components/types";

import {type Contract, uiEvents} from "./settings.component.contract.ts";
import {selectors} from "./settings.component.selectors.ts";
import {type State, createInitialState} from "./settings.component.state.ts";
import {stateUpdaters} from "./settings.component.updaters.ts";
import {type Dependencies, effects} from "./settings.component.effects.ts";
import {View} from "./settings.component.view.tsx";

export type SettingsDependencies = Dependencies;
export const settingsDef = (dependencies: SettingsDependencies): ComponentDef<Contract, State> => ({
    initialState: createInitialState(dependencies.settingsService.load()),
    selectors,
    uiEvents,
    stateUpdaters,
    effects: effects(dependencies),
});
export const Settings = View;
export type SettingsContract = Contract;
