import type {EventsContract} from "@softer-components/types";


export type EventNames =
    | "startGameRequested"
    | "setCardCountRequested"
    | "toggleMusicRequested"
    | "toggleSoundsRequested"
    | "toggleSettingsMenuRequested";
export const uiEvents = ["startGameRequested", "setCardCountRequested", "toggleMusicRequested", "toggleSoundsRequested", "toggleSettingsMenuRequested"] as const satisfies readonly EventNames[];

export type Events = EventsContract<
    EventNames, { setCardCountRequested: number }, typeof uiEvents
>;