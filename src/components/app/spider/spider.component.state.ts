import type {SpiderWin} from "../../../model/spider-records.model.ts";
import type {SpiderVariant} from "../../../model/spider.model.ts";

export const createInitialState = (savedVariants: SpiderVariant[], wins: SpiderWin[]) => ({
    isStarted: false,
    // the numbers of suits and of cards that have a game in progress to resume
    savedVariants,
    // the best won games of each kind
    wins,
});

export type State = ReturnType<typeof createInitialState>;
