import type {Contract} from "./game.component.contract.ts";
import type {Effects} from "@softer-components/types";
import {createDeck, shuffleDeck} from "../../../../model/deck.model.ts";
import type {AudioService} from "../../../../services/audio.service.ts";
import type {SchedulerService} from "../../../../services/scheduler.service.ts";
import {DELAYS_MS} from "./game.component.timings.ts";


export type Dependencies = {
    audioService: AudioService,
    schedulerService: SchedulerService,
};
export const effects = ({audioService, schedulerService}: Dependencies): Effects<Contract> => {
    const after = (delayMs: number, callback: () => void) => {
        schedulerService.schedule(callback, delayMs);
    };
    return {
        dealRequested: ({dealCompleted}, {payload: cardCount}) => {
            // forget whatever was still pending from a previous game
            schedulerService.cancelAll();
            audioService.startBackgroundMusic();
            const cardsToDeal = createDeck(cardCount);
            const shuffledDeck = shuffleDeck(cardsToDeal);
            const player1Cards = shuffledDeck.slice(0, cardsToDeal.length / 2);
            const player2Cards = shuffledDeck.slice(cardsToDeal.length / 2, cardsToDeal.length);
            after(DELAYS_MS.deal, () => dealCompleted({player1Cards, player2Cards}));
        },
        player1Clicked: ({player2Clicked}) => {
            after(DELAYS_MS.player2Answer, player2Clicked);
            audioService.stopAll();
        },
        // Card flips
        suspenseCompleted: () => audioService.playCardSlide(),
        player1RestackedRemainingCards: () => audioService.playCardSlide(),
        player2RestackedRemainingCards: () => audioService.playCardSlide(),
        suspenseStarted: ({suspenseCompleted}) => after(DELAYS_MS.suspense, suspenseCompleted),
        reviewWinnerStarted: ({reviewWinnerCompleted}) => after(DELAYS_MS.reviewWinner, reviewWinnerCompleted),
        hiddenPairRevealed: ({pairTransferred}) => {
            audioService.playCardSlide();
            after(DELAYS_MS.revealedPair, pairTransferred);
        },
        pairTransferPaused: ({pairTransferRequested}) => after(DELAYS_MS.pairTransferPause, pairTransferRequested),
        player1WonGame: () => audioService.playApplause(),
        player2WonGame: () => audioService.playCrowdDisappointment(),
    };
};
