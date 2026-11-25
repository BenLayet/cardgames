import type {StateUpdaters} from "@softer-components/types";

import type {Contract} from "./spider.component.contract";
import type {State} from "./spider.component.state";

export const stateUpdaters: StateUpdaters<Contract, State> = {
    // the new game is saved as soon as it is dealt
    startGameRequested: ({state}) => {
        state.isStarted = true;
        state.hasSavedGame = true;
    },
    resumeRequested: ({state}) => {
        state.isStarted = true;
    },
    goHomeRequested: ({state}) => {
        state.isStarted = false;
    },
    // a won game is not kept
    gameFinished: ({state}) => {
        state.hasSavedGame = false;
    },
};
