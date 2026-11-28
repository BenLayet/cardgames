import type {Effects} from "@softer-components/types";

import type {Contract} from "./spider.component.contract";
import type {SpiderRecordsService} from "../../../services/spider-records.service.ts";
import type {AudioService} from "../../../services/audio.service.ts";

export type Dependencies = {
    audioService: AudioService,
    spiderRecordsService: SpiderRecordsService,
};
export const effects = ({audioService, spiderRecordsService}: Dependencies): Effects<Contract> => ({
    goHomeRequested: () => {
        audioService.stopAll();
    },
    winRecorded: (_, {values}) => spiderRecordsService.save(values.wins()),
    recordsCleared: () => spiderRecordsService.save([]),
});
