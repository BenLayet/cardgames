import {type SavedSpiderGame, SPIDER_VARIANTS, type SpiderVariant, variantOf} from "../model/spider.model.ts";
import type {SpiderSaveService} from "../services/spider-save.service.ts";
import {decodeSavedGame, encodeSavedGame} from "./spider-save.codec.ts";

// one game for each number of cards and of suits
const storageKey = ({cardCount, suitCount}: SpiderVariant) => `cardgames.spider.game.${cardCount}.${suitCount}`;
// where the single game was kept before
const LEGACY_STORAGE_KEY = "cardgames.spider.game";

// Stores the games in the browser; without storage (private mode, blocked...) the games are simply not kept
export class LocalStorageSpiderSaveAdapter implements SpiderSaveService {
    constructor() {
        this.moveLegacyGame();
    }

    load(variant: SpiderVariant): SavedSpiderGame | null {
        try {
            const stored = localStorage.getItem(storageKey(variant));
            return stored === null ? null : decodeSavedGame(stored);
        } catch {
            return null;
        }
    }

    savedVariants(): SpiderVariant[] {
        try {
            return SPIDER_VARIANTS.filter(variant => localStorage.getItem(storageKey(variant)) !== null);
        } catch {
            return [];
        }
    }

    // the single game saved before goes to the key of its number of cards and of suits, once when the application starts
    private moveLegacyGame(): void {
        try {
            const stored = localStorage.getItem(LEGACY_STORAGE_KEY);
            if (stored === null) return;
            const game = decodeSavedGame(stored);
            if (game !== null) {
                const key = storageKey(variantOf(game.table));
                if (localStorage.getItem(key) === null) localStorage.setItem(key, stored);
            }
            localStorage.removeItem(LEGACY_STORAGE_KEY);
        } catch {
            // the legacy game is simply not kept
        }
    }

    // When the storage is full, the oldest moves are dropped from the undo until the game fits
    save(variant: SpiderVariant, game: SavedSpiderGame): void {
        let history = game.history;
        for (;;) {
            try {
                localStorage.setItem(storageKey(variant), encodeSavedGame({...game, history}));
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

    clear(variant: SpiderVariant): void {
        try {
            localStorage.removeItem(storageKey(variant));
        } catch (error) {
            console.error("Failed to clear the spider game:", error);
        }
    }
}
