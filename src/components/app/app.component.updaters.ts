import type {StateUpdaters} from "@softer-components/types";

import type {Contract} from "./app.component.contract";
import {gameDefinition} from "../../model/games.model.ts";
import type {State} from "./app.component.state";

export const stateUpdaters: StateUpdaters<Contract, State> = {
    gameSelected: ({payload: gameId, state}) => {
        // a game that is not playable yet stays on the home page
        if (gameDefinition(gameId).available) state.page = gameId;
    },
    homeRequested: ({state}) => {
        state.page = "HOME";
    },
};
