import type {EventForwarders} from "@softer-components/types";

import type {Contract} from "./game.component.contract.ts";
import {canMoveCards} from "../../../../model/spider.model.ts";

// the steps of a game: each event leads to the next one when its condition is met
export const eventForwarders = {
    internal: [
        // a click on a column while cards are selected in another one moves them there
        {
            from: "cardClicked", to: "moveRequested",
            onCondition: ({values, payload}) => {
                const selected = values.selected();
                return selected !== null && selected.column !== payload.column;
            },
            withPayload: ({values, payload}) => ({from: values.selected() ?? payload, to: payload.column}),
        },
        {
            from: "columnClicked", to: "moveRequested",
            onCondition: ({values, payload}) => {
                const selected = values.selected();
                return selected !== null && selected.column !== payload;
            },
            withPayload: ({values, payload}) => ({from: values.selected() ?? {column: payload, index: 0}, to: payload}),
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
