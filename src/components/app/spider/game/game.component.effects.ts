import type {Effects} from "@softer-components/types";

import type {Contract} from "./game.component.contract.ts";
import type {AudioService} from "../../../../services/audio.service.ts";
import type {SpiderSaveService} from "../../../../services/spider-save.service.ts";
import {dealSeededTable, pickSolvableSeed, type SavedSpiderGame, type SpiderVariant} from "../../../../model/spider.model.ts";

export type Dependencies = {
    audioService: AudioService,
    spiderSaveService: SpiderSaveService,
};
export const effects = ({audioService, spiderSaveService}: Dependencies): Effects<Contract> => {
    // the game is saved after each change, so that closing the application loses nothing
    // a won game cannot be resumed
    const save = (values: {
        savedGame: () => SavedSpiderGame, isWon: () => boolean, variant: () => SpiderVariant, hasCompletedSequence: () => boolean,
    }) => {
        // a completed sequence is collected right after, and that saves the game:
        // saving it here too could write it back after a won game was cleared
        if (values.hasCompletedSequence()) return;
        if (values.isWon()) spiderSaveService.clear(values.variant());
        else spiderSaveService.save(values.variant(), values.savedGame());
    };
    return {
        // picking the deal is random, so it happens here and not in the updaters
        dealRequested: ({dealCompleted}, {payload: {suitCount, cardCount}}) => {
            dealCompleted(dealSeededTable({suitCount, cardCount}, pickSolvableSeed({suitCount, cardCount})));
        },
        dealCompleted: (_, {values}) => save(values),
        restoreRequested: ({gameRestored}, {payload: variant}) => {
            const saved = spiderSaveService.load(variant);
            if (saved === null) return;
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
