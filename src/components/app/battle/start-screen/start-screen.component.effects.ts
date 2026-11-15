import type {Effects} from "@softer-components/types";

import type {Contract} from "./start-screen.component.contract.ts";
import type {AudioService} from "../../../../services/audio.service.ts";
import type {SettingsService} from "../../../../services/settings.service.ts";

export type Dependencies = {
    audioService: AudioService,
    settingsService: SettingsService,
};
export const effects = ({audioService, settingsService}: Dependencies): Effects<Contract> => ({
    setCardCountRequested: (_, {payload: cardCount}) => {
        settingsService.save({cardCount});
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
