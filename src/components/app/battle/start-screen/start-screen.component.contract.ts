import type {EventsContract} from "@softer-components/types";

import type {Values} from "./start-screen.component.selectors.ts";

export type EventNames =
    | "startGameRequested"
    | "setCardCountRequested";
export const uiEvents = ["startGameRequested", "setCardCountRequested"] as const satisfies readonly EventNames[];
export type Events = EventsContract<
    EventNames, { setCardCountRequested: number }, typeof uiEvents
>;

export type Contract = {
    events: Events;
    values: Values;
};
