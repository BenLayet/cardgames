import type {ExtractComponentValuesContract, Selector, Selectors} from "@softer-components/types";

import type {State} from "./spider.component.state";
import type {Children} from "./spider.component.contract.ts";
import {rankOf, type SpiderWin, topWins} from "../../../model/spider-records.model.ts";
import {sameVariant, type SpiderVariant} from "../../../model/spider.model.ts";

const isStarted = (state: State) => state.isStarted;
const isStartable = (state: State) => !state.isStarted;
const variant = ((_, childrenValues): SpiderVariant => ({
    suitCount: childrenValues.setup.values.suitCount(),
    cardCount: childrenValues.setup.values.cardCount(),
})) satisfies Selector<State, Children>;
// only the game of the chosen numbers of suits and cards can be resumed
const canResume = ((state: State, childrenValues) => !state.isStarted
    && state.savedVariants.some(saved => sameVariant(saved, variant(state, childrenValues)))) satisfies Selector<State, Children>;
// the won game, with its place among the best ones of its kind, and the best one before it
const victory = ((state: State, childrenValues) => {
    const win: SpiderWin | null = childrenValues.game.values.win();
    if (win === null) return null;
    return {win, moveRank: rankOf(state.wins, win), best: topWins(state.wins, win)[0] ?? null};
}) satisfies Selector<State, Children>;
export const selectors = {
    isStarted,
    isStartable,
    canResume,
    variant,
    wins: (state: State) => state.wins,
    victory,
} satisfies Selectors<State, Children>;
export type Values = ExtractComponentValuesContract<typeof selectors>;
