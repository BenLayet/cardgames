import type {EventsContract} from "@softer-components/types";

import type {BattleContract} from "./battle";
import type {SettingsContract} from "./settings";
import type {Values} from "./app.component.selectors";
import type {GameId} from "../../model/games.model.ts";

export const uiEvents = ["displayed", "gameSelected"] as const;
export const allEvents = [
    ...uiEvents,
    "homeRequested",
] as const;
export type Events = EventsContract<
    typeof allEvents, { gameSelected: GameId }, typeof uiEvents
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
