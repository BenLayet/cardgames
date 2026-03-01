import type {InternalEventForwarders} from "@softer-components/types";

import type {Contract} from "./game.component.contract.ts";

export const eventForwarders: InternalEventForwarders<Contract> = [
    {
        from: "player1Clicked",
        to: "player1WonCardsBackInHand",
        onCondition: ({values}) => values.shouldPlayer1PutCardsBackInHand()
    },
    {
        from: "player2Clicked",
        to: "player2WonCardsBackInHand",
        onCondition: ({values}) => values.shouldPlayer2PutCardsBackInHand()
    },
    {from: "player1Clicked", to: "player1Played", onCondition: ({values}) => values.canPlayer1Play()},
    {from: "player2Clicked", to: "player2Played", onCondition: ({values}) => values.canPlayer2Play()},
    {
        from: "player1Clicked",
        to: "player1PlacedHiddenCard",
        onCondition: ({values}) => values.canPlayer1GiveHiddenCard()
    }, {
        from: "player2Clicked",
        to: "player2PlacedHiddenCard",
        onCondition: ({values}) => values.canPlayer2GiveHiddenCard()
    },
    {from: "player2Played", to: "bothPlayersPlayed", onCondition: ({values}) => values.haveBothPlayerPlayed()},
    {from: "player1Played", to: "bothPlayersPlayed", onCondition: ({values}) => values.haveBothPlayerPlayed()},
    {from: "bothPlayersPlayed", to: "cardsAcknowledgmentStarted"},
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
    {from: "roundCompleted", to: "player1WonGame", onCondition: ({values}) => values.hasPlayer1WonGame()},
    {from: "roundCompleted", to: "player2WonGame", onCondition: ({values}) => values.hasPlayer2WonGame()},
    {from: "tieOccurred", to: "player1WonGame", onCondition: ({values}) => values.hasPlayer1WonGame()},
    {from: "tieOccurred", to: "player2WonGame", onCondition: ({values}) => values.hasPlayer2WonGame()},
    {from: "player2PlacedHiddenCard", to: "player1WonGame", onCondition: ({values}) => values.hasPlayer1WonGame()},
    {from: "player2PlacedHiddenCard", to: "player2WonGame", onCondition: ({values}) => values.hasPlayer2WonGame()},
    {from: "player1WonGame", to: "gameEnded"},
    {from: "player2WonGame", to: "gameEnded"},
];