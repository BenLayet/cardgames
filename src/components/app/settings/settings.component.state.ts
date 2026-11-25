import {DEFAULT_SETTINGS, type Settings} from "../../../services/settings.service.ts";
import {LANGUAGES, toLanguage} from "../../../services/language.service.ts";

export const createInitialState = ({language, musicVolume, soundsVolume}: Settings) => ({
    language: toLanguage(language),
    languages: LANGUAGES,
    musicVolume,
    soundsVolume,
    isMenuOpen: false,
});
export const initialState = createInitialState(DEFAULT_SETTINGS);
export type State = ReturnType<typeof createInitialState>;
