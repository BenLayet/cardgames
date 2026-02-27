import type {StateUpdaters} from "@softer-components/types";

import type {Contract} from "./battle.component.contract";
import {type State } from "./battle.component.state";

export const stateUpdaters: StateUpdaters<Contract, State> = {
    startGameRequested: ({state}) => {
        state.isStarted = true;
    }
};
