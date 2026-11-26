import type {EventForwarders} from "@softer-components/types";

import type {Contract} from "./game.component.contract.ts";

// the steps of a game: each event leads to the next one when its condition is met
export const eventForwarders = {
    internal: [
        {from: "dealCompleted", to: "gameStarted"},
        {from: "gameStarted", to: "readyForNextCards"},
        {from: "gameRestored", to: "readyForNextCards"},
        {from: "playerClicked", to: "playerPlayed", onCondition: ({values, payload}) => values.canPlay().at(payload) ?? false},
        {from: "playerPlayed", to: "allPlayed", onCondition: ({values}) => values.haveAllPlayed()},
        // between two rounds or two steps of a battle
        {from: "readyForNextCards", to: "gameWon", onCondition: ({values}) => values.hasGameWinner()},
        {from: "readyForNextCards", to: "gameTied", onCondition: ({values}) => values.isGameOver() && !values.hasGameWinner()},
        {from: "readyForNextCards", to: "roundWon", onCondition: ({values}) => values.isBattleWonByDefault()},
        {from: "readyForNextCards", to: "cardsSetAside", onCondition: ({values}) => values.isBattleLostByAll()},
        // every contender of a battle has a single card left: no face down card is laid
        {from: "readyForNextCards", to: "allPlayed", onCondition: ({values}) => values.haveAllPlayed()},
        {from: "allPlayed", to: "suspenseStarted", onCondition: ({values}) => values.shouldCardsBeShown()},
        {from: "allPlayed", to: "stepCompleted", onCondition: ({values}) => values.isFaceDownStep()},
        {from: "stepCompleted", to: "readyForNextCards"},
        {from: "suspenseCompleted", to: "reviewWinnerStarted"},
        {from: "reviewWinnerCompleted", to: "roundWon", onCondition: ({values}) => values.hasRoundLeader()},
        {from: "reviewWinnerCompleted", to: "tieOccurred", onCondition: ({values}) => !values.hasRoundLeader()},
        {from: "tieOccurred", to: "readyForNextCards"},
        {from: "roundWon", to: "hiddenCardsRevealed", onCondition: ({values}) => values.areHiddenCardsOnTable()},
        {from: "roundWon", to: "cardsCollected", onCondition: ({values}) => !values.areHiddenCardsOnTable()},
        {from: "cardsSetAside", to: "roundCompleted"},
        {from: "roundCompleted", to: "readyForNextCards"},
        {from: "gameWon", to: "gameEnded"},
        {from: "gameTied", to: "gameEnded"},
    ],
} satisfies EventForwarders<Contract>;
