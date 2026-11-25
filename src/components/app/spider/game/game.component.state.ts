import {type CardPosition, EMPTY_TABLE, type SpiderVariant, type Table} from "../../../../model/spider.model.ts";

export const initialState = {
    table: EMPTY_TABLE,
    // the tables before each move, the last one is restored by an undo
    history: [] as Table[],
    // the first of the cards chosen by a click when they can go to several columns
    selected: null as CardPosition | null,
    // which of the hints is shown, none until the hint button is pressed
    hintIndex: null as number | null,
    moveCount: 0,
    // the number of suits and of cards of the game, which has its own save
    variant: {suitCount: 1, cardCount: 104} as SpiderVariant,
    gameEnded: false,
};

export type State = typeof initialState;
