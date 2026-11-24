import {areValidSeats, defaultSeats, type GameDefinition} from "../../../model/games.model.ts";
import {DEFAULT_SETTINGS, type Settings} from "../../../services/settings.service.ts";

export const createInitialState = (game: GameDefinition, {cardCount, suitCount, seats}: Settings) => {
    const storedSeats: unknown = (seats as Partial<Record<string, unknown>> | null | undefined)?.[game.id];
    return {
        game,
        // ignore stored seats that the game no longer allows
        seats: areValidSeats(game, storedSeats) ? storedSeats : defaultSeats(game),
        // ignore a stored card count that is no longer offered
        cardCount: game.cardCountOptions.includes(cardCount) ? cardCount : DEFAULT_SETTINGS.cardCount,
        suitCount: game.suitCountOptions.includes(suitCount) ? suitCount : DEFAULT_SETTINGS.suitCount,
    };
};
export type State = ReturnType<typeof createInitialState>;
