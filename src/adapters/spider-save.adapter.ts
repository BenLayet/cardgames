import {isSavedSpiderGame, type SavedSpiderGame} from "../model/spider.model.ts";
import type {SpiderSaveService} from "../services/spider-save.service.ts";

const STORAGE_KEY = "cardgames.spider.game";

// Stores the game in the browser; without storage (private mode, blocked...) the game is simply not kept
export class LocalStorageSpiderSaveAdapter implements SpiderSaveService {
    load(): SavedSpiderGame | null {
        try {
            const stored: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
            return isSavedSpiderGame(stored) ? stored : null;
        } catch {
            return null;
        }
    }

    save(game: SavedSpiderGame): void {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(game));
        } catch (error) {
            console.error("Failed to save the spider game:", error);
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
