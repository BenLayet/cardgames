import type {Contract} from "./game.component.contract.ts";
import type {Effects} from "@softer-components/types";
import {type Card, createDeck, shuffleDeck} from "../../../../model/deck.model.ts";
import type {AudioService} from "../../../../services/audio.service.ts";
import type {SchedulerService} from "../../../../services/scheduler.service.ts";
import {DELAYS_MS} from "./game.component.timings.ts";
import type {BattleSaveService} from "../../../../services/battle-save.service.ts";
import {COMPUTER_SEAT} from "./game.component.state.ts";
import {battleVariant} from "../../../../services/battle-save.service.ts";
import {simulateGame} from "./game.component.simulation.ts";

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

// a deal is played in memory first: one whose game would never end is dealt again, however long the game
const MAX_DEALS = 100;
export type Deal = { piles: Card[][], dealSeed: number };
const newDeal = (cardCount: number, playerCount: number, random: () => number): Deal => ({
    piles: dealPiles(shuffleDeck(createDeck(cardCount), random), playerCount),
    dealSeed: Math.floor(random() * 2 ** 31),
});
export const dealPlayableGame = (cardCount: number, playerCount: number, random: () => number = Math.random): Deal => {
    let deal = newDeal(cardCount, playerCount, random);
    for (let attempt = 1; attempt < MAX_DEALS && simulateGame(deal.piles, deal.dealSeed).outcome !== "ends"; attempt++) {
        deal = newDeal(cardCount, playerCount, random);
    }
    return deal;
};

export const effects = ({audioService, schedulerService, battleSaveService}: Dependencies): Effects<Contract> => {
    const after = (delayMs: number, callback: () => void) => {
        schedulerService.schedule(callback, delayMs);
    };
    // once a round is won, the next step of the collection is done on its own if nobody taps before
    const collectLater = ({collectionTimedOut}: { collectionTimedOut: (step: string) => void }, values: { canRevealHiddenCards: () => boolean, canCollectCards: () => boolean, collectionStep: () => string }) => {
        if (!values.canRevealHiddenCards() && !values.canCollectCards()) return;
        const step = values.collectionStep();
        after(DELAYS_MS.autoCollect, () => collectionTimedOut(step));
    };
    return {
        dealRequested: ({dealCompleted}, {payload: {cardCount, playerCount, isSolo}}) => {
            // forget whatever was still pending from a previous game
            schedulerService.cancelAll();
            // a new game replaces the one of the same kind that could be resumed
            battleSaveService.clear(battleVariant(isSolo, playerCount, cardCount));
            const {piles, dealSeed} = dealPlayableGame(cardCount, playerCount);
            after(DELAYS_MS.deal, () => dealCompleted({piles, setAsideCount: cardCount % playerCount, dealSeed}));
        },
        // the game of the kind chosen on the menu goes on, with the names typed on the menu,
        // which may have changed since the game was left
        restoreRequested: ({gameRestored}, {payload: {isSolo, playerNames}, values}) => {
            schedulerService.cancelAll();
            const variant = values.variant();
            const saved = variant === null ? null : battleSaveService.load(variant);
            if (saved === null) return;
            gameRestored({...saved, isSolo, playerNames});
        },
        // a game resumed while the cards of a round are being collected goes on collecting them
        gameRestored: (dispatchers, {values}) => collectLater(dispatchers, values),
        // a cheer with the sparks of the winning card, for a human winner: the computer's wins stay silent
        roundWon: (dispatchers, {values}) => {
            const winner = values.seats().find(seat => seat.isRoundWinner);
            if (values.winningCard() !== null && winner && !winner.isComputer) audioService.playCheer();
            collectLater(dispatchers, values);
        },
        // the game is saved between two rounds and two steps of a battle,
        // so that it can be resumed after going back or closing the application;
        // a game where nobody has played yet is not kept: the first save comes after the first card played
        readyForNextCards: ({playerClicked, gameSaved}, {values}) => {
            if (values.isGameOver() || values.hasGameEnded()) return;
            const variant = values.variant();
            if (variant !== null && values.hasPlayed()) {
                battleSaveService.save(variant, values.savedGame());
                gameSaved();
            }
            // the computer may have to lay a card that the player does not: a battle when the player has a single card left
            const canPlay = values.canPlay();
            if (values.isSolo() && canPlay[COMPUTER_SEAT] && !canPlay[0]) after(DELAYS_MS.computerAnswer, () => playerClicked(COMPUTER_SEAT));
        },
        // an ended game is not kept
        gameEnded: (_, {values}) => {
            const variant = values.variant();
            if (variant !== null) battleSaveService.clear(variant);
        },
        playerClicked: () => audioService.stopAll(),
        // the computer answers only when the player's click played a card,
        // otherwise an ignored click would make the computer play alone once the next cards can be played
        playerPlayed: ({playerClicked}, {payload: index, values}) => {
            if (values.isSolo() && index !== COMPUTER_SEAT && values.canPlay()[COMPUTER_SEAT]) {
                after(DELAYS_MS.computerAnswer, () => playerClicked(COMPUTER_SEAT));
            }
        },
        // Card flips
        suspenseStarted: ({suspenseCompleted}) => after(DELAYS_MS.suspense, suspenseCompleted),
        reviewWinnerStarted: ({reviewWinnerCompleted}) => after(DELAYS_MS.reviewWinner, reviewWinnerCompleted),
        hiddenCardsRevealed: (dispatchers, {values}) => {
            audioService.playCardSlide();
            collectLater(dispatchers, values);
        },
        // the round is over once its last layer is collected
        layerCollected: (dispatchers, {values}) => {
            audioService.playCardSlide();
            if (!values.areCardsOnTable()) after(DELAYS_MS.collected, dispatchers.roundCompleted);
            else collectLater(dispatchers, values);
        },
        // against the computer, the crowd is disappointed when the computer wins; any human deserves applause
        gameWon: (_, {values}) => {
            if (values.isSolo() && values.seats()[COMPUTER_SEAT].rank === 1) audioService.playCrowdDisappointment();
            else audioService.playApplause();
        },
    };
};
