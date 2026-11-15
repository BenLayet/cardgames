import type {EventsContract} from "@softer-components/types";
import type {Language} from "../../../services/language.service.ts";


export type EventNames =
    | "toggleMenuRequested"
    | "setLanguageRequested"
    | "toggleMusicRequested"
    | "toggleSoundsRequested";
export const uiEvents = ["toggleMenuRequested", "setLanguageRequested", "toggleMusicRequested", "toggleSoundsRequested"] as const satisfies readonly EventNames[];

export type Events = EventsContract<
    EventNames, { setLanguageRequested: Language }, typeof uiEvents
>;
