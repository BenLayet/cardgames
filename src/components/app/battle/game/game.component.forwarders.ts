import type {InternalEventForwarders} from "@softer-components/types";

import type {Contract} from "./game.component.contract.ts";

export const eventForwarders: InternalEventForwarders<Contract> = [
    {from: "player1Clicked", to: "player1Played", onCondition: ({values}) => !values.shouldPlayer1GiveHiddenCard()},
    {from: "player2Clicked", to: "player2Played", onCondition: ({values}) => !values.shouldPlayer2GiveHiddenCard()},
    {
        from: "player1Clicked",
        to: "player1PlacedHiddenCard",
        onCondition: ({values}) => values.shouldPlayer1GiveHiddenCard()
    },    {
        from: "player2Clicked",
        to: "player2PlacedHiddenCard",
        onCondition: ({values}) => values.shouldPlayer2GiveHiddenCard()
    },
    {from: "player2Played", to: "cardsPlaced"},
    {from: "cardsAcknowledgmentCompleted", to: "checkWinnerRequested"},
    {
        from: "checkWinnerRequested", to: "player1WonRound",
        onCondition: ({values}) => values.hasPlayer1WonRound()
    },
    {
        from: "checkWinnerRequested", to: "player2WonRound",
        onCondition: ({values}) => values.hasPlayer2WonRound()
    },
    {
        from: "checkWinnerRequested", to: "tieOccurred",
        onCondition: ({values}) => !values.hasPlayer2WonRound() && !values.hasPlayer1WonRound()
    },
    {from: "player1WonRound", to: "roundCompleted"},
    {from: "player2WonRound", to: "roundCompleted"},
];