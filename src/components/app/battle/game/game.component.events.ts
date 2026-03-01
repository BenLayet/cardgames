import type {EventsContract} from "@softer-components/types";
import type {Card} from "../../../../model/deck.model.ts";


export type EventNames =
    | "gameStarted"
    | "gameEnded"
    | "dealRequested"
    | "dealCompleted"
    | "readyForNextCards"
    | "bothPlayersPlayed"
    | "suspenseStarted"
    | "suspenseCompleted"
    | "reviewWinnerStarted"
    | "reviewWinnerCompleted"
    | "checkWinnerRequested"
    | "tieOccurred"
    | "player1WonRound"
    | "player2WonRound"
    | "roundCompleted"
    | "player1Clicked"
    | "player2Clicked"
    | "player1Played"
    | "player2Played"
    | "player1RestackedRemainingCards"
    | "player2RestackedRemainingCards"
    | "player1WonGame"
    | "player2WonGame"
    | "playAgainRequested";
export const uiEvents= ["player1Clicked", "playAgainRequested"] as const satisfies readonly EventNames[];

export type Events = EventsContract<
    EventNames, { dealCompleted: { player1Cards: Card[], player2Cards: Card[] } }, typeof uiEvents
>;