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
    // the positions saved by the player: save the current one (at this time), go back to one, delete one
    "positionSaveRequested",
    "positionRestoreRequested",
    "positionDeleted",
    // the end of a game: a new game with the same options, or the menu of the game
    "playAgainRequested",
    "menuRequested",
    // the victory message is on screen, once the last sequence has reached its place
    "victoryShown",
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
    "positionRestored",
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
        positionSaveRequested: number,
        positionRestoreRequested: number,
        positionRestored: number,
        positionDeleted: number,
    }, typeof uiEvents
>;

export type Contract = {
    events: Events;
    values: Values;
};
