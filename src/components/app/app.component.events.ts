import type {EventsContract} from "@softer-components/types";


export type EventNames =
    | "displayed";
export const uiEvents: EventNames[] = ["displayed"];

export type Events = EventsContract<
    EventNames, {}, typeof uiEvents
>;