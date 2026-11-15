import type {EventsContract} from "@softer-components/types";

import type {BattleContract} from "./battle";
import type {SettingsContract} from "./settings";
import type {Values} from "./app.component.selectors";

export type EventNames =
    | "displayed";
export const uiEvents = ["displayed"] as const satisfies readonly EventNames[];
export type Events = EventsContract<
    EventNames, Record<never, never>, typeof uiEvents
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
