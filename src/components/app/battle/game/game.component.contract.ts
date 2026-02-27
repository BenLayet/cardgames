import type {Events} from "./game.component.events.ts";
import type {Values} from "./game.component.selectors.ts";

export type Contract = {
  events: Events;
  values: Values;
};
