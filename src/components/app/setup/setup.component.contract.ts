import type {EventsContract} from "@softer-components/types";

import type {Values} from "./setup.component.selectors.ts";

export const uiEvents = [
    "startGameRequested",
    "backRequested",
    "setCardCountRequested",
    "setSuitCountRequested",
    "renamePlayerRequested",
    "setPlayersRequested",
] as const;
export const allEvents = [
    ...uiEvents,
] as const;
export type Events = EventsContract<
    typeof allEvents, { setCardCountRequested: number, setSuitCountRequested: number, setPlayersRequested: number, renamePlayerRequested: { index: number, name: string } }, typeof uiEvents
>;

export type Contract = {
    events: Events;
    values: Values;
};
