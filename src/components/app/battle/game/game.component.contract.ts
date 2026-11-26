import type {EventsContract} from "@softer-components/types";

import type {Card} from "../../../../model/deck.model.ts";
import type {Values} from "./game.component.selectors.ts";

// the end of a game: a new game with the same options, or the menu of the game
export const uiEvents = ["player1Clicked", "player2Clicked", "playAgainRequested", "menuRequested"] as const;
export const allEvents = [
    ...uiEvents,
    "gameStarted",
    "gameEnded",
    "dealRequested",
    "dealCompleted",
    "readyForNextCards",
    "bothPlayersPlayed",
    "suspenseStarted",
    "suspenseCompleted",
    "reviewWinnerStarted",
    "reviewWinnerCompleted",
    "checkWinnerRequested",
    "tieOccurred",
    "player1WonRound",
    "player2WonRound",
    "roundCompleted",
    "pairTransferRequested",
    "hiddenPairRevealed",
    "pairTransferred",
    "pairTransferPaused",
    "player1Played",
    "player2Played",
    "player1RestackedRemainingCards",
    "player2RestackedRemainingCards",
    "player1WonGame",
    "player2WonGame",
] as const;
export type Events = EventsContract<
    typeof allEvents, { dealRequested: { cardCount: number, isPlayer2Computer: boolean, playerNames: (string | null)[] }, dealCompleted: { player1Cards: Card[], player2Cards: Card[] } }, typeof uiEvents
>;

export type Contract = {
    events: Events;
    values: Values;
};
