import type {EventsContract} from "@softer-components/types";


export type EventNames =
    | "startGameRequested"
    | "incrementCardCountRequested"
    | "decrementCardCountRequested"
    | "cardCountIncremented"
    | "cardCountDecremented"
    | "goHomeRequested";
export const uiEvents: EventNames[] = ["startGameRequested", "goHomeRequested", "incrementCardCountRequested", "decrementCardCountRequested"];

export type Events = EventsContract<
    EventNames, {}, typeof uiEvents
>;