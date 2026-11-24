import type {ComponentDef} from "@softer-components/types";

import {type Contract, uiEvents} from "./app.component.contract";
import {selectors} from "./app.component.selectors";
import {type State, initialState} from "./app.component.state";
import {View} from "./app.component.view";
import {stateUpdaters} from "./app.component.updaters";
import {eventForwarders} from "./app.component.forwarders";
import {battleDef, type BattleDependencies} from "./battle";
import {settingsDef, type SettingsDependencies} from "./settings";
import {spiderDef, type SpiderDependencies} from "./spider";

export type AppDependencies = BattleDependencies & SettingsDependencies & SpiderDependencies;
export const appDef = (dependencies: AppDependencies): ComponentDef<Contract, State> => ({
    initialState,
    selectors,
    uiEvents,
    stateUpdaters,
    eventForwarders,
    config: {
        childrenDefs: {
            battle: battleDef(dependencies),
            settings: settingsDef(dependencies),
            spider: spiderDef(dependencies),
        },
    },
});
export const App = View;
export type AppContract = Contract;
