import type {Children} from "./battle.component.children";
import type {Events} from "./battle.component.events";
import type {Values} from "./battle.component.selectors";

export type Contract = {
  events: Events;
  children: Children;
  values: Values;
};
