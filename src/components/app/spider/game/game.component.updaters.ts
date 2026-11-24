import type {StateUpdaters} from "@softer-components/types";

import type {Contract} from "./game.component.contract.ts";
import {initialState, type State} from "./game.component.state.ts";
import {
    canPickCards,
    collectCompletedSequences,
    dealRow,
    destinationsOf,
    moveCards,
    type Table,
} from "../../../../model/spider.model.ts";

// The model returns a new table, the previous one is kept to be restored by an undo
const play = (state: State, next: (table: Table) => Table): void => {
    state.history.push(state.table);
    state.table = next(state.table);
    state.moveCount++;
    state.selected = null;
    state.hintIndex = null;
};

export const stateUpdaters: StateUpdaters<Contract, State> = {
    dealRequested: () => initialState,
    dealCompleted: ({state, payload}) => {
        state.table = payload;
    },
    // a click on a card that is not where the selected cards go picks that card, see the forwarders
    cardPicked: ({state, payload}) => {
        const isAlreadySelected = state.selected?.column === payload.column && state.selected.index === payload.index;
        // cards with a single destination go there right away, see the forwarders
        const hasSeveralDestinations = canPickCards(state.table, payload) && destinationsOf(state.table, payload).length > 1;
        state.selected = !isAlreadySelected && hasSeveralDestinations ? payload : null;
        state.hintIndex = null;
    },
    // a click on a column where the selected cards go moves them, see the forwarders
    columnClicked: ({state, payload: column}) => {
        if (state.selected !== null && !destinationsOf(state.table, state.selected).includes(column)) state.selected = null;
        state.hintIndex = null;
    },
    moveRequested: ({state}) => {
        state.selected = null;
    },
    cardsMoved: ({state, payload: {from, to}}) => play(state, table => moveCards(table, from, to)),
    stockClicked: ({state}) => {
        state.selected = null;
        state.hintIndex = null;
    },
    rowDealt: ({state}) => play(state, dealRow),
    // collecting is part of the move or the deal before it: an undo restores the table before both
    sequencesCollected: ({state}) => {
        state.table = collectCompletedSequences(state.table);
    },
    undoRequested: ({state}) => {
        state.selected = null;
        state.hintIndex = null;
    },
    moveUndone: ({state}) => {
        const previous = state.history.pop();
        if (previous === undefined) return;
        state.table = previous;
        state.moveCount++;
    },
    // each press shows the next hint
    hintRequested: ({state}) => {
        state.selected = null;
        state.hintIndex = state.hintIndex === null ? 0 : state.hintIndex + 1;
    },
    gameEnded: ({state}) => {
        state.gameEnded = true;
    },
    playAgainRequested: () => initialState,
};
