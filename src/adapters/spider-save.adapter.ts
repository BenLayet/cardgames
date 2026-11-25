import {type SavedSpiderGame, SUIT_COUNT_OPTIONS, suitOf} from "../model/spider.model.ts";
import type {SpiderSaveService} from "../services/spider-save.service.ts";
import {decodeSavedGame, encodeSavedGame} from "./spider-save.codec.ts";

// one game for each number of suits
const storageKey = (suitCount: number) => `cardgames.spider.game.${suitCount}`;
// where the single game was kept before
const LEGACY_STORAGE_KEY = "cardgames.spider.game";

// the number of suits of a game: every card is on the table, in the stock or in a completed sequence
const suitCountOf = (game: SavedSpiderGame): number => new Set([
    ...game.table.columns.flat().map(c => suitOf(c.card)),
    ...game.table.stock.map(c => suitOf(c.card)),
    ...game.table.completed,
]).size;

// Stores the games in the browser; without storage (private mode, blocked...) the games are simply not kept
export class LocalStorageSpiderSaveAdapter implements SpiderSaveService {
    load(suitCount: number): SavedSpiderGame | null {
        this.moveLegacyGame();
        try {
            const stored = localStorage.getItem(storageKey(suitCount));
            return stored === null ? null : decodeSavedGame(stored);
        } catch {
            return null;
        }
    }

    savedSuitCounts(): number[] {
        this.moveLegacyGame();
        try {
            return SUIT_COUNT_OPTIONS.filter(suitCount => localStorage.getItem(storageKey(suitCount)) !== null);
        } catch {
            return [];
        }
    }

    // the game saved before there was one for each number of suits goes to the key of its number of suits
    private moveLegacyGame(): void {
        try {
            const stored = localStorage.getItem(LEGACY_STORAGE_KEY);
            if (stored === null) return;
            const game = decodeSavedGame(stored);
            const suitCount = game === null ? 0 : suitCountOf(game);
            if (SUIT_COUNT_OPTIONS.includes(suitCount) && localStorage.getItem(storageKey(suitCount)) === null) {
                localStorage.setItem(storageKey(suitCount), stored);
            }
            localStorage.removeItem(LEGACY_STORAGE_KEY);
        } catch {
            // the legacy game is simply not kept
        }
    }

    // When the storage is full, the oldest moves are dropped from the undo until the game fits
    save(suitCount: number, game: SavedSpiderGame): void {
        let history = game.history;
        for (;;) {
            try {
                localStorage.setItem(storageKey(suitCount), encodeSavedGame({...game, history}));
                return;
            } catch (error) {
                if (history.length === 0) {
                    console.error("Failed to save the spider game:", error);
                    return;
                }
                history = history.slice(Math.ceil(history.length / 2));
            }
        }
    }

    clear(suitCount: number): void {
        try {
            localStorage.removeItem(storageKey(suitCount));
        } catch (error) {
            console.error("Failed to clear the spider game:", error);
        }
    }
}
