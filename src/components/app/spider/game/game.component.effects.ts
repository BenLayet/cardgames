import type {Effects} from "@softer-components/types";

import type {Contract} from "./game.component.contract.ts";
import type {AudioService} from "../../../../services/audio.service.ts";
import type {SpiderSaveService} from "../../../../services/spider-save.service.ts";
import {createSpiderDeck, dealTable, type SavedSpiderGame} from "../../../../model/spider.model.ts";
import {shuffleDeck} from "../../../../model/deck.model.ts";

export type Dependencies = {
    audioService: AudioService,
    spiderSaveService: SpiderSaveService,
};
export const effects = ({audioService, spiderSaveService}: Dependencies): Effects<Contract> => {
    // the game is saved after each change, so that closing the application loses nothing
    // a won game cannot be resumed
    const save = (values: {
        savedGame: () => SavedSpiderGame, isWon: () => boolean, suitCount: () => number, hasCompletedSequence: () => boolean,
    }) => {
        // a completed sequence is collected right after, and that saves the game:
        // saving it here too could write it back after a won game was cleared
        if (values.hasCompletedSequence()) return;
        if (values.isWon()) spiderSaveService.clear(values.suitCount());
        else spiderSaveService.save(values.suitCount(), values.savedGame());
    };
    return {
        // shuffling is random, so it happens here and not in the updaters
        dealRequested: ({dealCompleted}, {payload: {suitCount}}) => {
            audioService.startBackgroundMusic();
            dealCompleted(dealTable(shuffleDeck(createSpiderDeck(suitCount))));
        },
        dealCompleted: (_, {values}) => save(values),
        restoreRequested: ({gameRestored}, {payload: {suitCount}}) => {
            const saved = spiderSaveService.load(suitCount);
            if (saved === null) return;
            audioService.startBackgroundMusic();
            gameRestored(saved);
        },
        cardsMoved: (_, {values}) => {
            audioService.playCardSlide();
            save(values);
        },
        rowDealt: (_, {values}) => {
            audioService.playCardSlide();
            save(values);
        },
        sequencesCollected: (_, {values}) => save(values),
        moveUndone: (_, {values}) => {
            audioService.playCardSlide();
            save(values);
        },
        gameWon: () => audioService.playApplause(),
    };
};
