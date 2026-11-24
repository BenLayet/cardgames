import type {StateUpdaters} from "@softer-components/types";

import type {Contract} from "./game.component.contract.ts";
import {initialState, type State} from "./game.component.state.ts";
import {
    canPickCards,
    collectCompletedSequences,
    dealRow,
    moveCards,
    type Table,
} from "../../../../model/spider.model.ts";

// The model returns a new table, the previous one is kept to be restored by an undo
const play = (state: State, next: (table: Table) => Table): void => {
    state.history.push(state.table);
    state.table = next(state.table);
    state.moveCount++;
    state.selected = null;
};

export const stateUpdaters: StateUpdaters<Contract, State> = {
    dealRequested: () => initialState,
    dealCompleted: ({state, payload}) => {
        state.table = payload;
    },
    // a click on another column is a move, see the forwarders
    cardClicked: ({state, payload}) => {
        if (state.selected !== null && state.selected.column !== payload.column) return;
        const isAlreadySelected = state.selected?.index === payload.index;
        state.selected = !isAlreadySelected && canPickCards(state.table, payload) ? payload : null;
    },
    columnClicked: ({state, payload: column}) => {
        if (state.selected?.column === column) state.selected = null;
    },
    moveRequested: ({state}) => {
        state.selected = null;
    },
    cardsMoved: ({state, payload: {from, to}}) => play(state, table => moveCards(table, from, to)),
    stockClicked: ({state}) => {
        state.selected = null;
    },
    rowDealt: ({state}) => play(state, dealRow),
    // collecting is part of the move or the deal before it: an undo restores the table before both
    sequencesCollected: ({state}) => {
        state.table = collectCompletedSequences(state.table);
    },
    undoRequested: ({state}) => {
        state.selected = null;
    },
    moveUndone: ({state}) => {
        const previous = state.history.pop();
        if (previous === undefined) return;
        state.table = previous;
        state.moveCount++;
    },
    gameEnded: ({state}) => {
        state.gameEnded = true;
    },
    playAgainRequested: () => initialState,
};
