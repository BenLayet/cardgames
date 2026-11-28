import type {EventsContract} from "@softer-components/types";

import type {GameContract} from "./game";
import type {SetupContract} from "../setup";
import type {Values} from "./spider.component.selectors";

export const uiEvents = ["goHomeRequested", "resumeRequested"] as const;
export const allEvents = [
    ...uiEvents,
    "startGameRequested",
    "homeRequested",
    "gameSaved",
    "gameFinished",
] as const;
export type Events = EventsContract<
    typeof allEvents, Record<never, never>, typeof uiEvents
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
