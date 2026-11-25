import type {SavedSpiderGame} from "../model/spider.model.ts";

// Keeps the spider game in progress so that it can be resumed after the application is closed
export interface SpiderSaveService {
    // null when there is no game to resume
    load(): SavedSpiderGame | null;
    save(game: SavedSpiderGame): void;
    clear(): void;
}
