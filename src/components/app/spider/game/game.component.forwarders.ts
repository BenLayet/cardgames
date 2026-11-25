import type {EventForwarders} from "@softer-components/types";

import type {Contract} from "./game.component.contract.ts";
import {canMoveCards, clickDestinationsOf} from "../../../../model/spider.model.ts";

// the steps of a game: each event leads to the next one when its condition is met
export const eventForwarders = {
    internal: [
        // a click on a column where the selected cards can go moves them there
        {
            from: "cardClicked", to: "moveRequested",
            onCondition: ({values, payload}) => values.destinations().includes(payload.column),
            withPayload: ({values, payload}) => ({from: values.selected() ?? payload, to: payload.column}),
        },
        {
            from: "cardClicked", to: "cardPicked",
            onCondition: ({values, payload}) => !values.destinations().includes(payload.column),
        },
        {
            from: "columnClicked", to: "moveRequested",
            onCondition: ({values, payload}) => values.destinations().includes(payload),
            withPayload: ({values, payload}) => ({from: values.selected() ?? {column: payload, index: 0}, to: payload}),
        },
        // cards that can only go to one column go there right away
        {
            from: "cardPicked", to: "moveRequested",
            onCondition: ({values, payload}) => clickDestinationsOf(values.table(), payload).length === 1,
            withPayload: ({values, payload}) => ({from: payload, to: clickDestinationsOf(values.table(), payload)[0]}),
        },
        {from: "cardsDropped", to: "moveRequested"},
        {
            from: "moveRequested", to: "cardsMoved",
            onCondition: ({values, payload}) => canMoveCards(values.table(), payload.from, payload.to),
        },
        {from: "stockClicked", to: "rowDealt", onCondition: ({values}) => values.canDealRow()},
        {from: "undoRequested", to: "moveUndone", onCondition: ({values}) => values.canUndo()},
        {from: "cardsMoved", to: "sequencesCollected", onCondition: ({values}) => values.hasCompletedSequence()},
        {from: "rowDealt", to: "sequencesCollected", onCondition: ({values}) => values.hasCompletedSequence()},
        {from: "sequencesCollected", to: "gameWon", onCondition: ({values}) => values.isWon()},
        {from: "gameWon", to: "gameEnded"},
    ],
} satisfies EventForwarders<Contract>;
