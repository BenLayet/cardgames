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
    setMusicVolumeRequested: (_, {payload: musicVolume}) => {
        audioService.setMusicVolume(musicVolume);
        settingsService.save({musicVolume});
    },
    setSoundsVolumeRequested: (_, {payload: soundsVolume}) => {
        audioService.setSoundsVolume(soundsVolume);
        settingsService.save({soundsVolume});
    },
});
