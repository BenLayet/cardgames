import type {Effects} from "@softer-components/types";

import type {Contract} from "./setup.component.contract.ts";
import type {SettingsService} from "../../../services/settings.service.ts";
import type {GameId, SeatKind} from "../../../model/games.model.ts";
import {MAX_NAME_LENGTH} from "./setup.component.state.ts";

export type Dependencies = {
    settingsService: SettingsService,
};
export const effects = ({settingsService}: Dependencies): Effects<Contract> => {
    // the seats of the other games are kept
    const saveSeats = (gameId: GameId, seats: SeatKind[]) => {
        settingsService.save({seats: {...settingsService.load().seats, [gameId]: seats}});
    };
    return {
        // the card counts of the other games are kept
        setCardCountRequested: (_, {values}) => {
            settingsService.save({cardCounts: {...settingsService.load().cardCounts, [values.gameId()]: values.cardCount()}});
        },
        // a number of suits that the number of cards does not allow is not kept
        setSuitCountRequested: (_, {values}) => {
            settingsService.save({suitCount: values.suitCount()});
        },
        // the number of cards may have changed with the players
        setPlayersRequested: (_, {values}) => {
            saveSeats(values.gameId(), values.seats());
            settingsService.save({cardCounts: {...settingsService.load().cardCounts, [values.gameId()]: values.cardCount()}});
        },
        // the names of the seats that this game does not show are kept
        renamePlayerRequested: (_, {payload: {index, name}}) => {
            const playerNames = [...settingsService.load().playerNames];
            while (playerNames.length < index) playerNames.push("");
            playerNames[index] = name.slice(0, MAX_NAME_LENGTH);
            settingsService.save({playerNames});
        },
    };
};
