import type {EventsContract} from "@softer-components/types";


export type EventNames =
    | "startGameRequested";
export const uiEvents: EventNames[] = ["startGameRequested"];

export type Events = EventsContract<
    EventNames, {}, typeof uiEvents
>;