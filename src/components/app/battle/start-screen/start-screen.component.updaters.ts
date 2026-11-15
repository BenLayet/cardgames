import type {StateUpdaters} from "@softer-components/types";

import type {Contract} from "./start-screen.component.contract.ts";
import {type State } from "./start-screen.component.state.ts";

export const stateUpdaters: StateUpdaters<Contract, State> = {
    setCardCountRequested: ({payload:cardCount, state}) => {
        state.cardCount = cardCount;
    },
    toggleMusicRequested: ({state}) => {
        state.musicEnabled = !state.musicEnabled;
    },
    toggleSoundsRequested: ({state}) => {
        state.soundsEnabled = !state.soundsEnabled;
    },
    toggleSettingsMenuRequested: ({state}) => {
        state.isSettingsMenuOpen = !state.isSettingsMenuOpen;
    },
};
