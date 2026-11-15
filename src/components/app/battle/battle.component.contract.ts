import type {EventsContract} from "@softer-components/types";

import type {GameContract} from "./game";
import type {StartScreenContract} from "./start-screen";
import type {Values} from "./battle.component.selectors";

export const uiEvents = ["goHomeRequested"] as const;
export const allEvents = [
    ...uiEvents,
    "startGameRequested",
] as const;
export type Events = EventsContract<
    typeof allEvents, Record<never, never>, typeof uiEvents
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
