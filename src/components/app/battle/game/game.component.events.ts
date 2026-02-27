import type {EventsContract} from "@softer-components/types";


export type EventNames =
    | "dealRequested"
    | "dealCompleted"
    | "cardsPlaced"
    | "moveCompleted"
    | "player1WonRound"
    | "player2WonRound"
    | "player1Played"
    | "player2Played";
export const uiEvents: EventNames[] = ["player1Played","player2Played"];

export type Events = EventsContract<
    EventNames, {}, typeof uiEvents
>;