import type {Effects} from "@softer-components/types";

import type {Contract} from "./battle.component.contract";
import type {AudioService} from "../../../services/audio.service.ts";
import type {SchedulerService} from "../../../services/scheduler.service.ts";

export type Dependencies = {
    audioService: AudioService,
    schedulerService: SchedulerService,
};
export const effects = ({audioService, schedulerService}: Dependencies): Effects<Contract> => ({
    goHomeRequested: () => {
        // the game may be left in the middle of a round
        schedulerService.cancelAll();
        audioService.stopAll();
        audioService.stopBackgroundMusic();
    },
});
