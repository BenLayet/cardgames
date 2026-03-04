import type {EventsContract} from "@softer-components/types";


export type EventNames =
    | "startGameRequested"
    | "setCardCountRequested";
export const uiEvents: EventNames[] = ["startGameRequested", "setCardCountRequested"];

export type Events = EventsContract<
    EventNames, { setCardCountRequested: number }, typeof uiEvents
>;