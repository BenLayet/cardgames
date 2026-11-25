import type {StateUpdaters} from "@softer-components/types";

import type {Contract} from "./settings.component.contract.ts";
import type {State} from "./settings.component.state.ts";

export const stateUpdaters: StateUpdaters<Contract, State> = {
    toggleMenuRequested: ({state}) => {
        state.isMenuOpen = !state.isMenuOpen;
    },
    setLanguageRequested: ({state, payload: language}) => {
        state.language = language;
    },
    setMusicVolumeRequested: ({state, payload: volume}) => {
        state.musicVolume = volume;
    },
    setSoundsVolumeRequested: ({state, payload: volume}) => {
        state.soundsVolume = volume;
    },
};
