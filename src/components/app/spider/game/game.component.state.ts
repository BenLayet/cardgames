import {type CardPosition, EMPTY_TABLE, type Table} from "../../../../model/spider.model.ts";

export const initialState = {
    table: EMPTY_TABLE,
    // the tables before each move, the last one is restored by an undo
    history: [] as Table[],
    // the first of the cards chosen by a click, which a click on another column moves there
    selected: null as CardPosition | null,
    moveCount: 0,
    gameEnded: false,
};

export type State = typeof initialState;
