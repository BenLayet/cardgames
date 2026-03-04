import type {EventsContract} from "@softer-components/types";


export type EventNames =
    | "startGameRequested"
    | "goHomeRequested";
export const uiEvents: EventNames[] = ["goHomeRequested"];

export type Events = EventsContract<
    EventNames, {}, typeof uiEvents
>;