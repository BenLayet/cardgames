import type {StateUpdaters} from "@softer-components/types";

import type {Contract} from "./game.component.contract.ts";
import {type State } from "./game.component.state.ts";

export const stateUpdaters: StateUpdaters<Contract, State> = {
    dealCompleted: ({state, payload}) => {
        state.player1.remainingCards = payload.player1Cards;
        state.player2.remainingCards = payload.player2Cards;
    }
};
