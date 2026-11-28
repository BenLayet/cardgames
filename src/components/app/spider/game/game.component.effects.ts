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
    // a won game cannot be resumed, and a game not started yet is not kept:
    // the first save is at the first move (or the first position saved),
    // and a new game replaces the one of the same kind that could be resumed
    const save = (gameSaved: () => void, values: {
        savedGame: () => SavedSpiderGame, isWon: () => boolean, variant: () => SpiderVariant, hasCompletedSequence: () => boolean,
    }) => {
        // a completed sequence is collected right after, and that saves the game:
        // saving it here too could write it back after a won game was cleared
        if (values.hasCompletedSequence()) return;
        const game = values.savedGame();
        const isStarted = game.moveCount > 0 || game.positions.length > 0;
        if (values.isWon() || !isStarted) spiderSaveService.clear(values.variant());
        else {
            spiderSaveService.save(values.variant(), game);
            gameSaved();
        }
    };
    return {
        // picking the deal is random, so it happens here and not in the updaters
        dealRequested: ({dealCompleted}, {payload: {suitCount, cardCount}}) => {
            dealCompleted(dealSeededTable({suitCount, cardCount}, pickSolvableSeed({suitCount, cardCount})));
        },
        dealCompleted: ({gameSaved}, {values}) => save(gameSaved, values),
        restoreRequested: ({gameRestored}, {payload: variant}) => {
            const saved = spiderSaveService.load(variant);
            if (saved === null) return;
            gameRestored(saved);
        },
        cardsMoved: ({gameSaved}, {values}) => {
            audioService.playCardSlide();
            save(gameSaved, values);
        },
        rowDealt: ({gameSaved}, {values}) => {
            audioService.playCardSlide();
            save(gameSaved, values);
        },
        sequencesCollected: ({gameSaved}, {values}) => save(gameSaved, values),
        moveUndone: ({gameSaved}, {values}) => {
            audioService.playCardSlide();
            save(gameSaved, values);
        },
        positionSaveRequested: ({gameSaved}, {values}) => save(gameSaved, values),
        positionRestored: ({gameSaved}, {values}) => {
            audioService.playCardSlide();
            save(gameSaved, values);
        },
        positionDeleted: ({gameSaved}, {values}) => save(gameSaved, values),
        // the cheer goes with the sparks of the completed sequence, not with the move that completed it
        sequenceCelebrated: () => audioService.playCheer(),
        // the applause goes with the victory message, not with the winning move
        victoryShown: () => audioService.playApplause(),
    };
};
