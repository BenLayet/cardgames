import type {ComponentDef} from "@softer-components/types";

import type {Contract} from "./app.component.contract";
import {uiEvents} from "./app.component.events";
import {selectors} from "./app.component.selectors";
import {type State, initialState} from "./app.component.state";
import {battleDef, type BattleDependencies} from "./battle";
import {settingsDef, type SettingsDependencies} from "./settings";

export type Dependencies = BattleDependencies & SettingsDependencies;
export const componentDef = (dependencies:Dependencies): ComponentDef<Contract, State> => {
    return {
        initialState,
        selectors,
        uiEvents,
        childrenComponentDefs: {
            battle: battleDef(dependencies),
            settings: settingsDef(dependencies),
        },
    };
};
