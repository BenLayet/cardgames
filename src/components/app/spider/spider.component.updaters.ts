import type {StateUpdaters} from "@softer-components/types";

import type {Contract} from "./spider.component.contract";
import type {State} from "./spider.component.state";

export const stateUpdaters: StateUpdaters<Contract, State> = {
    // the new game is saved as soon as it is dealt, in place of the one with the same number of suits
    startGameRequested: ({state, values}) => {
        state.isStarted = true;
        if (!state.savedSuitCounts.includes(values.suitCount())) state.savedSuitCounts.push(values.suitCount());
    },
    resumeRequested: ({state}) => {
        state.isStarted = true;
    },
    goHomeRequested: ({state}) => {
        state.isStarted = false;
    },
    // a won game is not kept
    gameFinished: ({state, values}) => {
        state.savedSuitCounts = state.savedSuitCounts.filter(suitCount => suitCount !== values.suitCount());
    },
};
