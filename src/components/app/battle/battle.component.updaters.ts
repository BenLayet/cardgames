import type {StateUpdaters} from "@softer-components/types";

import type {Contract} from "./battle.component.contract";
import {type State} from "./battle.component.state";
import {sameBattleVariant} from "../../../services/battle-save.service.ts";

export const stateUpdaters: StateUpdaters<Contract, State> = {
    // the new game replaces the saved one of the same kind once it is dealt
    startGameRequested: ({state, values}) => {
        state.isStarted = true;
        state.savedVariants = state.savedVariants.filter(saved => !sameBattleVariant(saved, values.variant()));
    },
    resumeRequested: ({state}) => {
        state.isStarted = true;
    },
    gameSaved: ({state, values}) => {
        if (!state.savedVariants.some(saved => sameBattleVariant(saved, values.variant()))) state.savedVariants.push(values.variant());
    },
    // an ended game is not kept
    gameFinished: ({state, values}) => {
        state.savedVariants = state.savedVariants.filter(saved => !sameBattleVariant(saved, values.variant()));
    },
    goHomeRequested: ({state}) => {
        state.isStarted = false;
    },
};
