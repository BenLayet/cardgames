import type {StateUpdaters} from "@softer-components/types";

import type {Contract} from "./spider.component.contract";
import type {State} from "./spider.component.state";
import {withWin} from "../../../model/spider-records.model.ts";
import {sameVariant} from "../../../model/spider.model.ts";

export const stateUpdaters: StateUpdaters<Contract, State> = {
    // the new game replaces the saved one with the same numbers of suits and cards;
    // it is kept, to be resumed, only from its first move
    startGameRequested: ({state, values}) => {
        state.isStarted = true;
        state.savedVariants = state.savedVariants.filter(saved => !sameVariant(saved, values.variant()));
    },
    gameSaved: ({state, values}) => {
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
    winRecorded: ({state, payload}) => {
        state.wins = withWin(state.wins, payload);
    },
    recordsCleared: ({state}) => {
        state.wins = [];
    },
};
