import type {EventsContract} from "@softer-components/types";

import type {BattleContract} from "./battle";
import type {SettingsContract} from "./settings";
import type {Values} from "./app.component.selectors";

export const uiEvents = ["displayed"] as const;
export const allEvents = [
    ...uiEvents,
] as const;
export type Events = EventsContract<
    typeof allEvents, Record<never, never>, typeof uiEvents
>;

export type Children = {
    battle: BattleContract;
    settings: SettingsContract;
};

export type Contract = {
    events: Events;
    children: Children;
    values: Values;
};
