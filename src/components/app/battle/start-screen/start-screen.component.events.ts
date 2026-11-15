import type {EventsContract} from "@softer-components/types";


export type EventNames =
    | "startGameRequested"
    | "setCardCountRequested";
export const uiEvents = ["startGameRequested", "setCardCountRequested"] as const satisfies readonly EventNames[];

export type Events = EventsContract<
    EventNames, { setCardCountRequested: number }, typeof uiEvents
>;