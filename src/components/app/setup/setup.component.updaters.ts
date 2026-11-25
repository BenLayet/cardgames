import type {StateUpdaters} from "@softer-components/types";

import type {Contract} from "./setup.component.contract.ts";
import {MAX_NAME_LENGTH, type State} from "./setup.component.state.ts";

export const stateUpdaters: StateUpdaters<Contract, State> = {
    setCardCountRequested: ({payload: cardCount, state}) => {
        state.cardCount = cardCount;
    },
    setSuitCountRequested: ({payload: suitCount, state}) => {
        state.suitCount = suitCount;
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
    renamePlayerRequested: ({payload: {index, name}, state}) => {
        if (index < 0 || index >= state.game.maxPlayers) return;
        while (state.playerNames.length < index) state.playerNames.push("");
        state.playerNames[index] = name.slice(0, MAX_NAME_LENGTH);
    },
};
