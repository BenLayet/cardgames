import type {SavedSpiderGame} from "../model/spider.model.ts";
import type {SpiderSaveService} from "../services/spider-save.service.ts";
import {decodeSavedGame, encodeSavedGame} from "./spider-save.codec.ts";

const STORAGE_KEY = "cardgames.spider.game";

// Stores the game in the browser; without storage (private mode, blocked...) the game is simply not kept
export class LocalStorageSpiderSaveAdapter implements SpiderSaveService {
    load(): SavedSpiderGame | null {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored === null ? null : decodeSavedGame(stored);
        } catch {
            return null;
        }
    }

    // When the storage is full, the oldest moves are dropped from the undo until the game fits
    save(game: SavedSpiderGame): void {
        let history = game.history;
        for (;;) {
            try {
                localStorage.setItem(STORAGE_KEY, encodeSavedGame({...game, history}));
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

    clear(): void {
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (error) {
            console.error("Failed to clear the spider game:", error);
        }
    }
}
