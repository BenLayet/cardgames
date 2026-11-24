import type {Effects} from "@softer-components/types";

import type {Contract} from "./game.component.contract.ts";
import type {AudioService} from "../../../../services/audio.service.ts";
import {createSpiderDeck, dealTable} from "../../../../model/spider.model.ts";
import {shuffleDeck} from "../../../../model/deck.model.ts";

export type Dependencies = {
    audioService: AudioService,
};
export const effects = ({audioService}: Dependencies): Effects<Contract> => ({
    // shuffling is random, so it happens here and not in the updaters
    dealRequested: ({dealCompleted}, {payload: {suitCount}}) => {
        audioService.startBackgroundMusic();
        dealCompleted(dealTable(shuffleDeck(createSpiderDeck(suitCount))));
    },
    cardsMoved: () => audioService.playCardSlide(),
    rowDealt: () => audioService.playCardSlide(),
    moveUndone: () => audioService.playCardSlide(),
    gameWon: () => audioService.playApplause(),
});
