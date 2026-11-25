import type {StateUpdaters} from "@softer-components/types";

import type {Contract} from "./spider.component.contract";
import type {State} from "./spider.component.state";
import {sameVariant} from "../../../model/spider.model.ts";

export const stateUpdaters: StateUpdaters<Contract, State> = {
    // the new game is saved as soon as it is dealt, in place of the one with the same numbers of suits and cards
    startGameRequested: ({state, values}) => {
        state.isStarted = true;
        if (!state.savedVariants.some(saved => sameVariant(saved, values.variant()))) state.savedVariants.push(values.variant());
    },
    resumeRequested: ({state}) => {
        state.isStarted = true;
    },
    goHomeRequested: ({state}) => {
        state.isStarted = false;
    },
    // a won game is not kept
    gameFinished: ({state, values}) => {
        state.savedVariants = state.savedVariants.filter(saved => !sameVariant(saved, values.variant()));
    },
};
