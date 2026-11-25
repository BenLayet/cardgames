import type {SavedSpiderGame} from "../model/spider.model.ts";

// Keeps the spider games in progress so that they can be resumed after the application is closed:
// one game for each number of suits
export interface SpiderSaveService {
    // null when there is no game to resume with this number of suits
    load(suitCount: number): SavedSpiderGame | null;
    save(suitCount: number, game: SavedSpiderGame): void;
    clear(suitCount: number): void;
    // the numbers of suits that have a game to resume
    savedSuitCounts(): number[];
}
