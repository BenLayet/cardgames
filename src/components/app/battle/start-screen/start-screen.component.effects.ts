import type {Effects} from "@softer-components/types";

import type {Contract} from "./start-screen.component.contract.ts";
import type {SettingsService} from "../../../../services/settings.service.ts";

export type Dependencies = {
    settingsService: SettingsService,
};
export const effects = ({settingsService}: Dependencies): Effects<Contract> => ({
    setCardCountRequested: (_, {payload: cardCount}) => {
        settingsService.save({cardCount});
    },
});
