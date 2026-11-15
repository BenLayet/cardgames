import type {Effects} from "@softer-components/types";

import type {Contract} from "./settings.component.contract.ts";
import type {AudioService} from "../../../services/audio.service.ts";
import type {SettingsService} from "../../../services/settings.service.ts";
import type {LanguageService} from "../../../services/language.service.ts";

export type Dependencies = {
    audioService: AudioService,
    settingsService: SettingsService,
    languageService: LanguageService,
};
export const effects = ({audioService, settingsService, languageService}: Dependencies): Effects<Contract> => ({
    setLanguageRequested: (_, {payload: language}) => {
        languageService.setLanguage(language);
        settingsService.save({language});
    },
    toggleMusicRequested: (_, {values}) => {
        const musicEnabled = values.musicEnabled();
        audioService.setMusicEnabled(musicEnabled);
        settingsService.save({musicEnabled});
    },
    toggleSoundsRequested: (_, {values}) => {
        const soundsEnabled = values.soundsEnabled();
        audioService.setSoundsEnabled(soundsEnabled);
        settingsService.save({soundsEnabled});
    },
});
