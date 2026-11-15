import type {Effects} from "@softer-components/types";

import type {Contract} from "./battle.component.contract";
import type {AudioService} from "../../../services/audio.service.ts";

export type Dependencies = {
    audioService: AudioService
};
export const effects = ({audioService}: Dependencies): Effects<Contract> => ({
    goHomeRequested: () => {
        audioService.stopAll();
        audioService.stopBackgroundMusic();
    },
});
