import {componentDef, type Dependencies} from "./battle.component.config";
import type {Contract} from "./battle.component.contract";
import { View } from "./battle.component.view";

export type BattleDependencies = Dependencies;
export const battleDef = componentDef;
export const Battle = View;
export type BattleContract = Contract;
