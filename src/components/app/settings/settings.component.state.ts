import {DEFAULT_SETTINGS, type Settings} from "../../../services/settings.service.ts";
import {LANGUAGES, toLanguage} from "../../../services/language.service.ts";

export const createInitialState = ({language, musicEnabled, soundsEnabled}: Settings) => ({
    language: toLanguage(language),
    languages: LANGUAGES,
    musicEnabled,
    soundsEnabled,
    isMenuOpen: false,
});
export const initialState = createInitialState(DEFAULT_SETTINGS);
export type State = ReturnType<typeof createInitialState>;
