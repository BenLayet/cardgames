import type {StateUpdaters} from "@softer-components/types";

import {isCardCountAvailable, isSuitCountAvailable, soloSeats} from "../../../model/games.model.ts";
import type {Contract} from "./setup.component.contract.ts";
import {availableCardCount, availableSuitCount, MAX_NAME_LENGTH, type State} from "./setup.component.state.ts";

export const stateUpdaters: StateUpdaters<Contract, State> = {
    setCardCountRequested: ({payload: cardCount, state}) => {
        if (!isCardCountAvailable(state.game, cardCount, state.seats.length)) return;
        state.cardCount = cardCount;
        state.suitCount = availableSuitCount(state.game, cardCount, state.suitCount);
    },
    setSuitCountRequested: ({payload: suitCount, state}) => {
        if (!isSuitCountAvailable(state.game, state.cardCount, suitCount)) return;
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
    // one human against the computer, or 2 humans or more: the number of cards follows when it is too small for them
    setPlayersRequested: ({payload: humanCount, state}) => {
        if (!state.game.soloOrHumans || humanCount < 1 || humanCount > state.game.maxPlayers) return;
        state.seats = soloSeats(humanCount);
        state.cardCount = availableCardCount(state.game, state.cardCount, state.seats.length);
    },
    renamePlayerRequested: ({payload: {index, name}, state}) => {
        if (index < 0 || index >= state.game.maxPlayers) return;
        while (state.playerNames.length < index) state.playerNames.push("");
        state.playerNames[index] = name.slice(0, MAX_NAME_LENGTH);
    },
};
