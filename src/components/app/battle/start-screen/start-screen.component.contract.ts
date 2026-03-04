import type {Events} from "./start-screen.component.events.ts";
import type {Values} from "./start-screen.component.selectors.ts";

export type Contract = {
  events: Events;
  values: Values;
};
