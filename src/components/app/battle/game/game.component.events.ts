import type {EventsContract} from "@softer-components/types";
import type {Card} from "../../../../model/deck.model.ts";


export type EventNames =
    | "dealRequested"
    | "dealCompleted"
    | "cardsPlaced"
    | "cardsAcknowledgmentStarted"
    | "cardsAcknowledgmentCompleted"
    | "checkWinnerRequested"
    | "tieOccurred"
    | "player1WonRound"
    | "player2WonRound"
    | "roundCompleted"
    | "player1Clicked"
    | "player2Clicked"
    | "player1PlacedHiddenCard"
    | "player2PlacedHiddenCard"
    | "player1Played"
    | "player2Played";
export const uiEvents: EventNames[] = ["player1Clicked"];

export type Events = EventsContract<
    EventNames, { dealCompleted: { player1Cards: Card[], player2Cards: Card[] } }, typeof uiEvents
>;