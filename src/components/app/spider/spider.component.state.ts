import type {SpiderVariant} from "../../../model/spider.model.ts";

export const createInitialState = (savedVariants: SpiderVariant[]) => ({
    isStarted: false,
    // the numbers of suits and of cards that have a game in progress to resume
    savedVariants,
});

export type State = ReturnType<typeof createInitialState>;
