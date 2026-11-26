import type {
    ExtractComponentValuesContract,
    Selectors, Selector
} from "@softer-components/types";
import type {State} from "./battle.component.state";
import type {Children} from "./battle.component.contract.ts";
import {battleVariant, type BattleVariant, sameBattleVariant} from "../../../services/battle-save.service.ts";

const isStarted = (state: State) => state.isStarted;
const isStartable = (state: State) => !state.isStarted;
const cardCount = ((_, childrenValues) => childrenValues.setup.values.cardCount()) satisfies Selector<State, Children>;
// one human against the computer, or only humans
const isSolo = ((_, childrenValues) => childrenValues.setup.values.seats().includes("computer")) satisfies Selector<State, Children>;
const playerCount = ((_, childrenValues) => childrenValues.setup.values.seats().length) satisfies Selector<State, Children>;
const playerNames = ((_, childrenValues) => childrenValues.setup.values.seatNames()) satisfies Selector<State, Children>;
const shouldMenuBeVisible = isStarted;
// the kind of game chosen on the menu: one game of each kind can be resumed
const variant = ((state: State, childrenValues): BattleVariant =>
    battleVariant(isSolo(state, childrenValues), playerCount(state, childrenValues), cardCount(state, childrenValues))) satisfies Selector<State, Children>;
const canResume = ((state: State, childrenValues) => !state.isStarted
    && state.savedVariants.some(saved => sameBattleVariant(saved, variant(state, childrenValues)))) satisfies Selector<State, Children>;
export const selectors = {
    isStarted,
    cardCount,
    isSolo,
    playerCount,
    playerNames,
    isStartable,
    shouldMenuBeVisible,
    canResume,
    variant,
} satisfies Selectors<State, Children>;
export type Values = ExtractComponentValuesContract<typeof selectors>;
