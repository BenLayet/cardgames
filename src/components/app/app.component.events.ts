import type {EventsContract} from "@softer-components/types";


export type EventNames =
    | "displayed";
export const uiEvents = ["displayed"] as const satisfies readonly EventNames[];

export type Events = EventsContract<
    EventNames, {}, typeof uiEvents
>;