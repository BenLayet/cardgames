import type {Settings} from "../../../../services/settings.service.ts";

export const createInitialState = ({musicEnabled, soundsEnabled}: Settings) => ({
    cardCount: 32,
    cardCountOptions: [12, 16, 32, 52],
    musicEnabled,
    soundsEnabled,
    isSettingsMenuOpen: false,
});
export const initialState = createInitialState({language: null, musicEnabled: true, soundsEnabled: true});
export type State = ReturnType<typeof createInitialState>;
