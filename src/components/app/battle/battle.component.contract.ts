import type {EventsContract} from "@softer-components/types";

import type {GameContract} from "./game";
import type {StartScreenContract} from "./start-screen";
import type {Values} from "./battle.component.selectors";

export type EventNames =
    | "startGameRequested"
    | "goHomeRequested";
export const uiEvents = ["goHomeRequested"] as const satisfies readonly EventNames[];
export type Events = EventsContract<
    EventNames, {}, typeof uiEvents
>;

export type Children = {
    game: GameContract,
    startScreen: StartScreenContract,
};

export type Contract = {
    events: Events;
    children: Children;
    values: Values;
};
