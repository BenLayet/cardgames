import type {Contract} from "./game.component.contract.ts";
import type {Effects} from "@softer-components/types";
import {type Card, createDeck, shuffleDeck} from "../../../../model/deck.model.ts";
import type {AudioService} from "../../../../services/audio.service.ts";
import type {SchedulerService} from "../../../../services/scheduler.service.ts";
import {DELAYS_MS} from "./game.component.timings.ts";
import type {BattleSaveService} from "../../../../services/battle-save.service.ts";
import {COMPUTER_SEAT} from "./game.component.state.ts";
import {maxRounds, simulateGame} from "./game.component.simulation.ts";

export type Dependencies = {
    audioService: AudioService,
    schedulerService: SchedulerService,
    battleSaveService: BattleSaveService,
};

// every player gets the same number of cards: the cards left over are not dealt
export const dealPiles = <T>(deck: T[], playerCount: number): T[][] => {
    const perPlayer = Math.floor(deck.length / playerCount);
    return Array.from({length: playerCount}, (_, seat) => deck.slice(seat * perPlayer, (seat + 1) * perPlayer));
};

// a deal is played in memory first: one that would never end, or last too long, is shuffled again
const MAX_SHUFFLES = 500;
export const dealPlayablePiles = (cardCount: number, playerCount: number, random: () => number = Math.random): Card[][] => {
    let piles = dealPiles(shuffleDeck(createDeck(cardCount), random), playerCount);
    const limit = maxRounds(cardCount, playerCount);
    for (let shuffle = 1; shuffle < MAX_SHUFFLES && simulateGame(piles, limit).outcome !== "ends"; shuffle++) {
        piles = dealPiles(shuffleDeck(createDeck(cardCount), random), playerCount);
    }
    return piles;
};

export const effects = ({audioService, schedulerService, battleSaveService}: Dependencies): Effects<Contract> => {
    const after = (delayMs: number, callback: () => void) => {
        schedulerService.schedule(callback, delayMs);
    };
    return {
        dealRequested: ({dealCompleted}, {payload: {cardCount, playerCount}}) => {
            // forget whatever was still pending from a previous game
            schedulerService.cancelAll();
            // a new game replaces the one that could be resumed
            battleSaveService.clear();
            const piles = dealPlayablePiles(cardCount, playerCount);
            after(DELAYS_MS.deal, () => dealCompleted({piles, setAsideCount: cardCount % playerCount}));
        },
        // the game goes on with the players chosen on the menu, which may have changed since the game was left,
        // as long as the number of players is the same
        restoreRequested: ({gameRestored}, {payload: {isSolo, playerNames}}) => {
            schedulerService.cancelAll();
            const saved = battleSaveService.load();
            if (saved === null) return;
            const menuPlayerCount = isSolo ? 2 : playerNames.length;
            gameRestored(menuPlayerCount === saved.seats.length ? {...saved, isSolo, playerNames} : saved);
        },
        // the game is saved between two rounds and two steps of a battle,
        // so that it can be resumed after going back or closing the application
        readyForNextCards: ({playerClicked}, {values}) => {
            if (values.isGameOver() || values.hasGameEnded()) return;
            battleSaveService.save(values.savedGame());
            // the computer may have to lay a card that the player does not: a battle when the player has a single card left
            const canPlay = values.canPlay();
            if (values.isSolo() && canPlay[COMPUTER_SEAT] && !canPlay[0]) after(DELAYS_MS.computerAnswer, () => playerClicked(COMPUTER_SEAT));
        },
        // an ended game is not kept
        gameEnded: () => battleSaveService.clear(),
        playerClicked: () => audioService.stopAll(),
        // the computer answers only when the player's click played a card,
        // otherwise an ignored click would make the computer play alone once the next cards can be played
        playerPlayed: ({playerClicked}, {payload: index, values}) => {
            if (values.isSolo() && index !== COMPUTER_SEAT && values.canPlay()[COMPUTER_SEAT]) {
                after(DELAYS_MS.computerAnswer, () => playerClicked(COMPUTER_SEAT));
            }
        },
        // Card flips
        suspenseCompleted: () => audioService.playCardSlide(),
        suspenseStarted: ({suspenseCompleted}) => after(DELAYS_MS.suspense, suspenseCompleted),
        reviewWinnerStarted: ({reviewWinnerCompleted}) => after(DELAYS_MS.reviewWinner, reviewWinnerCompleted),
        hiddenCardsRevealed: ({cardsCollected}) => {
            audioService.playCardSlide();
            after(DELAYS_MS.revealedCards, cardsCollected);
        },
        cardsCollected: ({roundCompleted}) => {
            audioService.playCardSlide();
            after(DELAYS_MS.collected, roundCompleted);
        },
        // against the computer, the crowd is disappointed when the computer wins; any human deserves applause
        gameWon: (_, {values}) => {
            if (values.isSolo() && values.seats()[COMPUTER_SEAT].rank === 1) audioService.playCrowdDisappointment();
            else audioService.playApplause();
        },
    };
};
