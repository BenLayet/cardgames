import type {Contract} from "./game.component.contract.ts";
import type {Effects} from "@softer-components/types";
import {createDeck, shuffleDeck} from "../../../../model/deck.model.ts";
import type {AudioService} from "../../../../services/audio.service.ts";


export type Dependencies = {
    audioService: AudioService
};
export const effects = ({audioService}: Dependencies): Effects<Contract> => ({
        dealRequested: ({dealCompleted}, {payload: cardCount}) => {
            const cardsToDeal = createDeck(cardCount);
            const shuffledDeck = shuffleDeck(cardsToDeal);
            const player1Cards = shuffledDeck.slice(0, cardsToDeal.length / 2);
            const player2Cards = shuffledDeck.slice(cardsToDeal.length / 2, cardsToDeal.length);
            setTimeout(() => dealCompleted({player1Cards, player2Cards}), 500)
        },
        player1Clicked: ({player2Clicked}) => {
            // auto click player 2 after a short delay to give the impression that player 2 is playing in response to player 1
            setTimeout(player2Clicked, 100);
            audioService.stopAll();
        },
        suspenseStarted: ({suspenseCompleted}) => {
            setTimeout(suspenseCompleted, 600)
        },
        reviewWinnerStarted: ({reviewWinnerCompleted}) => {
            setTimeout(reviewWinnerCompleted, 500)
        },
        player1WonGame: () => {
            audioService.playApplause();
        }
    }
)