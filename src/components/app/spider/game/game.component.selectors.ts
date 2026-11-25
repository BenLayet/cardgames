import type {ExtractComponentValuesContract, Selectors} from "@softer-components/types";

import type {State} from "./game.component.state.ts";
import {
    canDealRow,
    clickDestinationsOf,
    findHints,
    hasCompletedSequence,
    isWon,
    movableRunStart,
    stockRowCount,
    type SavedSpiderGame,
} from "../../../../model/spider.model.ts";

export const selectors = {
    table: (state: State) => state.table,
    columns: (state: State) => state.table.columns,
    // index of the first card that can be picked up in each column
    movableRunStarts: (state: State) => state.table.columns.map(movableRunStart),
    completed: (state: State) => state.table.completed,
    stockRowCount: (state: State) => stockRowCount(state.table),
    canDealRow: (state: State) => canDealRow(state.table),
    // the stock is not empty but a column is
    isDealBlocked: (state: State) => state.table.stock.length > 0 && !canDealRow(state.table),
    hasCompletedSequence: (state: State) => hasCompletedSequence(state.table),
    isWon: (state: State) => isWon(state.table),
    selected: (state: State) => state.selected,
    // the columns where the selected cards can go
    destinations: (state: State) => state.selected === null ? [] : clickDestinationsOf(state.table, state.selected),
    hint: (state: State) => {
        if (state.hintIndex === null) return null;
        const hints = findHints(state.table);
        return hints[state.hintIndex % hints.length];
    },
    moveCount: (state: State) => state.moveCount,
    canUndo: (state: State) => state.history.length > 0 && !state.gameEnded,
    hasGameEnded: (state: State) => state.gameEnded,
    suitCount: (state: State) => state.suitCount,
    // what is kept to resume the game, every move included so that all of them can still be undone
    savedGame: (state: State): SavedSpiderGame => ({
        table: state.table,
        history: state.history,
        moveCount: state.moveCount,
    }),
} satisfies Selectors<State>;
export type Values = ExtractComponentValuesContract<typeof selectors>;
