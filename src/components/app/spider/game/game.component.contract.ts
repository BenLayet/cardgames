import type {EventsContract} from "@softer-components/types";

import type {CardPosition, Table} from "../../../../model/spider.model.ts";
import type {Values} from "./game.component.selectors.ts";

export type Move = { from: CardPosition, to: number };

export const uiEvents = [
    "cardClicked",
    "columnClicked",
    "cardsDropped",
    "stockClicked",
    "undoRequested",
    "playAgainRequested",
] as const;
export const allEvents = [
    ...uiEvents,
    "dealRequested",
    "dealCompleted",
    "moveRequested",
    "cardsMoved",
    "rowDealt",
    "sequencesCollected",
    "moveUndone",
    "gameWon",
    "gameEnded",
] as const;
export type Events = EventsContract<
    typeof allEvents, {
        cardClicked: CardPosition,
        columnClicked: number,
        cardsDropped: Move,
        dealRequested: { suitCount: number },
        dealCompleted: Table,
        moveRequested: Move,
        cardsMoved: Move,
    }, typeof uiEvents
>;

export type Contract = {
    events: Events;
    values: Values;
};
