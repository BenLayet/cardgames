import type {Events} from "./settings.component.events.ts";
import type {Values} from "./settings.component.selectors.ts";

export type Contract = {
    events: Events;
    values: Values;
};
