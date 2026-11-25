import {areValidSeats, defaultSeats, type GameDefinition} from "../../../model/games.model.ts";
import {DEFAULT_SETTINGS, type Settings} from "../../../services/settings.service.ts";

export const MAX_NAME_LENGTH = 16;
// ignore stored names that are not text, such as a value written by hand
const validNames = (names: unknown): string[] => Array.isArray(names)
    ? names.map(name => typeof name === "string" ? name.slice(0, MAX_NAME_LENGTH) : "")
    : [];

// the stored card count of the game, or its default when it is no longer offered
const validCardCount = (game: GameDefinition, cardCounts: unknown): number => {
    const stored: unknown = (cardCounts as Partial<Record<string, unknown>> | null | undefined)?.[game.id];
    return typeof stored === "number" && game.cardCountOptions.includes(stored)
        ? stored
        : DEFAULT_SETTINGS.cardCounts[game.id] ?? game.cardCountOptions.at(0) ?? 0;
};

export const createInitialState = (game: GameDefinition, {cardCounts, suitCount, seats, playerNames}: Settings) => {
    const storedSeats: unknown = (seats as Partial<Record<string, unknown>> | null | undefined)?.[game.id];
    return {
        game,
        // ignore stored seats that the game no longer allows
        seats: areValidSeats(game, storedSeats) ? storedSeats : defaultSeats(game),
        cardCount: validCardCount(game, cardCounts),
        suitCount: game.suitCountOptions.includes(suitCount) ? suitCount : DEFAULT_SETTINGS.suitCount,
        playerNames: validNames(playerNames),
    };
};
export type State = ReturnType<typeof createInitialState>;
