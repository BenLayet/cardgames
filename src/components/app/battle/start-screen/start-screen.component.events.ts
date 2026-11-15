import type {EventsContract} from "@softer-components/types";


export type EventNames =
    | "startGameRequested"
    | "setCardCountRequested"
    | "toggleMusicRequested"
    | "toggleSoundsRequested"
    | "toggleSettingsMenuRequested";
export const uiEvents: EventNames[] = ["startGameRequested", "setCardCountRequested", "toggleMusicRequested", "toggleSoundsRequested", "toggleSettingsMenuRequested"];

export type Events = EventsContract<
    EventNames, { setCardCountRequested: number }, typeof uiEvents
>;