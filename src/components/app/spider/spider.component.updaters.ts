import type {StateUpdaters} from "@softer-components/types";

import type {Contract} from "./spider.component.contract";
import type {State} from "./spider.component.state";

export const stateUpdaters: StateUpdaters<Contract, State> = {
    startGameRequested: ({state}) => {
        state.isStarted = true;
    },
    goHomeRequested: ({state}) => {
        state.isStarted = false;
    },
};
