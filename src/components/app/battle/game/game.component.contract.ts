import type {EventsContract} from "@softer-components/types";

import type {Card} from "../../../../model/deck.model.ts";
import type {Values} from "./game.component.selectors.ts";

export const uiEvents = ["player1Clicked", "playAgainRequested"] as const;
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
    "player2Clicked",
    "player1Played",
    "player2Played",
    "player1RestackedRemainingCards",
    "player2RestackedRemainingCards",
    "player1WonGame",
    "player2WonGame",
] as const;
export type Events = EventsContract<
    typeof allEvents, { dealRequested: number, dealCompleted: { player1Cards: Card[], player2Cards: Card[] } }, typeof uiEvents
>;

export type Contract = {
    events: Events;
    values: Values;
};
