import type {EventsContract} from "@softer-components/types";

import type {Values} from "./start-screen.component.selectors.ts";

export const uiEvents = ["startGameRequested", "setCardCountRequested"] as const;
export const allEvents = [
    ...uiEvents,
] as const;
export type Events = EventsContract<
    typeof allEvents, { setCardCountRequested: number }, typeof uiEvents
>;

export type Contract = {
    events: Events;
    values: Values;
};
