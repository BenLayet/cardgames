import type {EventsContract} from "@softer-components/types";

import type {CardPosition, Move, SavedSpiderGame, SpiderVariant, Table} from "../../../../model/spider.model.ts";
import type {Values} from "./game.component.selectors.ts";

export const uiEvents = [
    "cardClicked",
    "columnClicked",
    "cardsDropped",
    "stockClicked",
    "undoRequested",
    "hintRequested",
    "playAgainRequested",
] as const;
export const allEvents = [
    ...uiEvents,
    "dealRequested",
    "dealCompleted",
    "restoreRequested",
    "gameRestored",
    "cardPicked",
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
        cardPicked: CardPosition,
        dealRequested: SpiderVariant,
        restoreRequested: SpiderVariant,
        dealCompleted: Table,
        gameRestored: SavedSpiderGame,
        moveRequested: Move,
        cardsMoved: Move,
    }, typeof uiEvents
>;

export type Contract = {
    events: Events;
    values: Values;
};
