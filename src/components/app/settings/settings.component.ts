import {componentDef, type Dependencies} from "./settings.component.config.ts";
import type {Contract} from "./settings.component.contract.ts";
import {View} from "./settings.component.view.tsx";

export const settingsDef = componentDef;
export const Settings = View;
export type SettingsContract = Contract;
export type SettingsDependencies = Dependencies;
