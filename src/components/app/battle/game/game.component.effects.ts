import type {Contract} from "./game.component.contract.ts";
import type {Effects} from "@softer-components/types";
import {DECK, shuffleDeck} from "../../../../model/deck.model.ts";

export const effects: Effects<Contract> = {
    dealRequested: ({dealCompleted}) => {
        const shuffledDeck = shuffleDeck(DECK);
        const player1Cards = shuffledDeck.slice(0, DECK.length / 2);
        const player2Cards = shuffledDeck.slice(DECK.length / 2, DECK.length);
        setTimeout(() => dealCompleted({player1Cards, player2Cards}), 1000)
    },
    player1Clicked:({player2Clicked}) => {
        // auto click player 2 after a short delay to give the impression that player 2 is playing in response to player 1
        setTimeout(player2Clicked, 100)
    },
    bothPlayersPlayed:({cardsAcknowledgmentStarted}) => {
        setTimeout(cardsAcknowledgmentStarted, 1000)
    },
    cardsAcknowledgmentStarted:({cardsAcknowledgmentCompleted}) => {
        setTimeout(cardsAcknowledgmentCompleted, 1000)
    }
}
