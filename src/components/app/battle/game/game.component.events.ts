import type {EventsContract} from "@softer-components/types";
import type {Card} from "../../../../model/deck.model.ts";


export type EventNames =
    | "dealRequested"
    | "dealCompleted"
    | "cardsPlaced"
    | "moveCompleted"
    | "player1WonRound"
    | "player2WonRound"
    | "player1Played"
    | "player2Played";
export const uiEvents: EventNames[] = ["player1Played", "player2Played"];

export type Events = EventsContract<
    EventNames, { dealCompleted: { player1Cards: Card[], player2Cards: Card[] } }, typeof uiEvents
>;