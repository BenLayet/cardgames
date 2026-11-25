import type {SavedSpiderGame, SpiderVariant} from "../model/spider.model.ts";

// Keeps the spider games in progress so that they can be resumed after the application is closed:
// one game for each number of suits and of cards
export interface SpiderSaveService {
    // null when there is no game to resume with these choices
    load(variant: SpiderVariant): SavedSpiderGame | null;
    save(variant: SpiderVariant, game: SavedSpiderGame): void;
    clear(variant: SpiderVariant): void;
    // the choices that have a game to resume
    savedVariants(): SpiderVariant[];
}
