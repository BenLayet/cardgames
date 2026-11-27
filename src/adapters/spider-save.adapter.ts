import {type SavedSpiderGame, SPIDER_VARIANTS, type SpiderVariant, variantOf} from "../model/spider.model.ts";
import type {SpiderSaveService} from "../services/spider-save.service.ts";
import {LocalStorageVariantStore} from "./local-storage-variant-store.ts";
import {decodeSavedGame, encodeSavedGame} from "./spider-save.codec.ts";

// one game for each number of cards and of suits
const storageKey = ({cardCount, suitCount}: SpiderVariant) => `cardgames.spider.game.${cardCount}.${suitCount}`;

// the newer half of an undo history
const newerHalf = <T>(history: T[]) => history.slice(Math.ceil(history.length / 2));

// When the storage is full, the oldest moves are dropped from the undo, of the game and of its saved positions,
// until the game fits; once there is nothing left to undo, the oldest saved positions go
export const shrinkGame = (game: SavedSpiderGame): SavedSpiderGame | null => {
    const hasHistory = game.history.length > 0 || game.positions.some(position => position.history.length > 0);
    if (hasHistory) return {
        ...game,
        history: newerHalf(game.history),
        positions: game.positions.map(position => ({...position, history: newerHalf(position.history)})),
    };
    return game.positions.length === 0 ? null : {...game, positions: game.positions.slice(1)};
};

// Stores the games in the browser; without storage (private mode, blocked...) the games are simply not kept
export class LocalStorageSpiderSaveAdapter implements SpiderSaveService {
    private readonly store = new LocalStorageVariantStore<SpiderVariant, SavedSpiderGame>({
        name: "spider",
        storageKey,
        variantOfKey: key => SPIDER_VARIANTS.find(variant => storageKey(variant) === key) ?? null,
        encode: encodeSavedGame,
        decode: decodeSavedGame,
        // where the single game was kept before
        legacy: {key: "cardgames.spider.game", variantOf: game => variantOf(game.table)},
        shrink: shrinkGame,
    });

    load = (variant: SpiderVariant) => this.store.load(variant);
    savedVariants = () => this.store.savedVariants();
    save = (variant: SpiderVariant, game: SavedSpiderGame) => this.store.save(variant, game);
    clear = (variant: SpiderVariant) => this.store.clear(variant);
}
