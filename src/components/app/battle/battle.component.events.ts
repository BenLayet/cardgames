import type {EventsContract} from "@softer-components/types";


export type EventNames =
    | "startGameRequested"
    | "goHomeRequested";
export const uiEvents = ["goHomeRequested"] as const satisfies readonly EventNames[];

export type Events = EventsContract<
    EventNames, {}, typeof uiEvents
>;