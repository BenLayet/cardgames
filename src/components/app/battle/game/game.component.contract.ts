import type {EventsContract} from "@softer-components/types";

import type {Card} from "../../../../model/deck.model.ts";
import type {Values} from "./game.component.selectors.ts";
import type {SavedBattleGame} from "../../../../services/battle-save.service.ts";

// the players: one human against the computer, or 2 to 6 humans, with the names typed on the setup screen
export type BattlePlayers = { isSolo: boolean, playerNames: (string | null)[] };

// a tap or a key plays the pile of a seat; the end of a game: a new game with the same options, or the menu of the game
export const uiEvents = ["playerClicked", "playAgainRequested", "menuRequested"] as const;
export const allEvents = [
    ...uiEvents,
    "gameStarted",
    "gameEnded",
    "dealRequested",
    "dealCompleted",
    "restoreRequested",
    "gameRestored",
    "readyForNextCards",
    "playerPlayed",
    "allPlayed",
    "stepCompleted",
    "suspenseStarted",
    "suspenseCompleted",
    "reviewWinnerStarted",
    "reviewWinnerCompleted",
    "tieOccurred",
    "roundWon",
    "hiddenCardsRevealed",
    "layerCollected",
    "cardsSetAside",
    "roundCompleted",
    "gameWon",
    "gameTied",
] as const;
export type Events = EventsContract<
    typeof allEvents, {
        playerClicked: number,
        playerPlayed: number,
        dealRequested: BattlePlayers & { cardCount: number, playerCount: number },
        restoreRequested: BattlePlayers & { cardCount: number },
        // dealSeed: how the cards collected in each round are shuffled; without it, they are collected in seat order
        dealCompleted: { piles: Card[][], setAsideCount: number, dealSeed?: number },
        gameRestored: SavedBattleGame,
    }, typeof uiEvents
>;

export type Contract = {
    events: Events;
    values: Values;
};
