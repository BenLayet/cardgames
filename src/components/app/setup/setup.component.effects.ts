import type {Effects} from "@softer-components/types";

import type {Contract} from "./setup.component.contract.ts";
import type {SettingsService} from "../../../services/settings.service.ts";
import type {GameId, SeatKind} from "../../../model/games.model.ts";

export type Dependencies = {
    settingsService: SettingsService,
};
export const effects = ({settingsService}: Dependencies): Effects<Contract> => {
    // the seats of the other games are kept
    const saveSeats = (gameId: GameId, seats: SeatKind[]) => {
        settingsService.save({seats: {...settingsService.load().seats, [gameId]: seats}});
    };
    return {
        setCardCountRequested: (_, {payload: cardCount}) => {
            settingsService.save({cardCount});
        },
        setSuitCountRequested: (_, {payload: suitCount}) => {
            settingsService.save({suitCount});
        },
        addPlayerRequested: (_, {values}) => saveSeats(values.gameId(), values.seats()),
        removePlayerRequested: (_, {values}) => saveSeats(values.gameId(), values.seats()),
        toggleSeatRequested: (_, {values}) => saveSeats(values.gameId(), values.seats()),
    };
};
