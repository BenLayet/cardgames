import {componentDef, type Dependencies} from "./app.component.config";
import type {Contract} from "./app.component.contract";
import { View } from "./app.component.view";

export type AppDependencies = Dependencies;
export const appDef = componentDef;
export const App = View;
export type AppContract = Contract;
