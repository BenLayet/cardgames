import type {EventsContract} from "@softer-components/types";

import type {GameContract} from "./game";
import type {SetupContract} from "../setup";
import type {SpiderWin} from "../../../model/spider-records.model.ts";
import type {Values} from "./spider.component.selectors";

export const uiEvents = ["goHomeRequested", "resumeRequested", "recordsCleared"] as const;
export const allEvents = [
    ...uiEvents,
    "startGameRequested",
    "homeRequested",
    "gameSaved",
    "gameFinished",
    "winRecorded",
] as const;
export type Events = EventsContract<
    typeof allEvents, { winRecorded: SpiderWin }, typeof uiEvents
>;

export type Children = {
    game: GameContract,
    setup: SetupContract,
};

export type Contract = {
    events: Events;
    children: Children;
    values: Values;
};
