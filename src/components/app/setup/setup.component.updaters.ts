import type {StateUpdaters} from "@softer-components/types";

import type {Contract} from "./setup.component.contract.ts";
import type {State} from "./setup.component.state.ts";

export const stateUpdaters: StateUpdaters<Contract, State> = {
    setCardCountRequested: ({payload: cardCount, state}) => {
        state.cardCount = cardCount;
    },
    addPlayerRequested: ({values, state}) => {
        if (!values.canAddPlayer()) return;
        state.seats.push(state.game.computerOpponents ? "computer" : "human");
    },
    removePlayerRequested: ({values, state}) => {
        if (!values.canRemovePlayer()) return;
        state.seats.pop();
    },
    toggleSeatRequested: ({payload: index, values, state}) => {
        if (index >= state.seats.length || !values.changeableSeats()[index]) return;
        state.seats[index] = state.seats[index] === "human" ? "computer" : "human";
    },
};
