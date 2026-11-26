import type {StateUpdaters} from "@softer-components/types";

import type {Contract} from "./battle.component.contract";
import {type State } from "./battle.component.state";

export const stateUpdaters: StateUpdaters<Contract, State> = {
    // the new game replaces the saved one once it is dealt
    startGameRequested: ({state}) => {
        state.isStarted = true;
        state.hasSavedGame = false;
    },
    resumeRequested: ({state}) => {
        state.isStarted = true;
    },
    gameSaved: ({state}) => {
        state.hasSavedGame = true;
    },
    // an ended game is not kept
    gameFinished: ({state}) => {
        state.hasSavedGame = false;
    },
    goHomeRequested: ({state}) => {
        state.isStarted = false;
    },
};
