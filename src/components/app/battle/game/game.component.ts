import { componentDef } from "./game.component.config.ts";
import type {Contract} from "./game.component.contract.ts";
import { View } from "./game.component.view.tsx";

export const gameDef = componentDef;
export const Game = View;
export type GameContract = Contract;
