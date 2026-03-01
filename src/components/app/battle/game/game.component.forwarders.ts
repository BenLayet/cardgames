import type {InternalEventForwarders} from "@softer-components/types";

import type {Contract} from "./game.component.contract.ts";

export const eventForwarders: InternalEventForwarders<Contract> = [
    {from: "dealCompleted", to: "gameStarted"},
    {from: "gameStarted", to: "readyForNextCards"},
    {from: "player1Clicked", to: "player1Played", onCondition: ({values}) => values.canPlayer1Play()},
    {from: "player2Clicked", to: "player2Played", onCondition: ({values}) => values.canPlayer2Play()},
    {from: "player2Played", to: "bothPlayersPlayed", onCondition: ({values}) => values.haveBothPlayerPlayed()},
    {from: "player1Played", to: "bothPlayersPlayed", onCondition: ({values}) => values.haveBothPlayerPlayed()},
    {from: "bothPlayersPlayed", to: "suspenseStarted", onCondition: ({values}) => values.shouldCardsBeShown()},
    {from: "bothPlayersPlayed", to: "readyForNextCards", onCondition: ({values}) => !values.shouldCardsBeShown()},
    {from: "suspenseCompleted", to: "reviewWinnerStarted"},
    {
        from: "reviewWinnerCompleted", to: "player1WonRound",
        onCondition: ({values}) => values.hasPlayer1WonRound()
    },
    {
        from: "reviewWinnerCompleted", to: "player2WonRound",
        onCondition: ({values}) => values.hasPlayer2WonRound()
    },
    {
        from: "reviewWinnerCompleted", to: "tieOccurred",
        onCondition: ({values}) => !values.hasPlayer2WonRound() && !values.hasPlayer1WonRound()
    },
    {from: "player1WonRound", to: "roundCompleted"},
    {from: "player2WonRound", to: "roundCompleted"},
    {from: "tieOccurred", to: "readyForNextCards"},
    {from: "roundCompleted", to: "readyForNextCards"},
    {
        from: "readyForNextCards",
        to: "player1RestackedRemainingCards",
        onCondition: ({values}) => values.shouldPlayer1RestackRemainingCards()
    },
    {
        from: "readyForNextCards",
        to: "player2RestackedRemainingCards",
        onCondition: ({values}) => values.shouldPlayer2RestackRemainingCards()
    },
    {from: "readyForNextCards", to: "player1WonGame", onCondition: ({values}) => values.hasPlayer1WonGame()},
    {from: "readyForNextCards", to: "player2WonGame", onCondition: ({values}) => values.hasPlayer2WonGame()},
    {from: "readyForNextCards", to: "gameEnded", onCondition: ({values}) => values.isTiedGame()},
    {from: "player1WonGame", to: "gameEnded"},
    {from: "player2WonGame", to: "gameEnded"},
];