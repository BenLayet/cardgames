import type {EventsContract} from "@softer-components/types";

import type {Language} from "../../../services/language.service.ts";
import type {Values} from "./settings.component.selectors.ts";

export const uiEvents = ["toggleMenuRequested", "setLanguageRequested", "setMusicVolumeRequested", "setSoundsVolumeRequested"] as const;
export const allEvents = [
    ...uiEvents,
] as const;
export type Events = EventsContract<
    typeof allEvents, { setLanguageRequested: Language, setMusicVolumeRequested: number, setSoundsVolumeRequested: number }, typeof uiEvents
>;

export type Contract = {
    events: Events;
    values: Values;
};
