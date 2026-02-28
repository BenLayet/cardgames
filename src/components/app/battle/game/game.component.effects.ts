import type {Contract} from "./game.component.contract.ts";
import type {Effects} from "@softer-components/types";
import {DECK, shuffleDeck} from "../../../../model/deck.model.ts";

export const effects: Effects<Contract> = {
    dealRequested: ({dealCompleted}) => {
        const shuffledDeck = shuffleDeck(DECK);
        const player1Cards = shuffledDeck.slice(0, DECK.length / 2);
        const player2Cards = shuffledDeck.slice(DECK.length / 2, DECK.length);
        dealCompleted({player1Cards, player2Cards});
    },
}
