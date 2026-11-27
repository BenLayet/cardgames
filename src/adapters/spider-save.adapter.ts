import {type SavedSpiderGame, SPIDER_VARIANTS, type SpiderVariant, variantOf} from "../model/spider.model.ts";
import type {SpiderSaveService} from "../services/spider-save.service.ts";
import {LocalStorageVariantStore} from "./local-storage-variant-store.ts";
import {decodeSavedGame, encodeSavedGame} from "./spider-save.codec.ts";

// one game for each number of cards and of suits
const storageKey = ({cardCount, suitCount}: SpiderVariant) => `cardgames.spider.game.${cardCount}.${suitCount}`;

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
        // when the storage is full, the oldest moves are dropped from the undo until the game fits
        shrink: game => game.history.length === 0 ? null : {...game, history: game.history.slice(Math.ceil(game.history.length / 2))},
    });

    load = (variant: SpiderVariant) => this.store.load(variant);
    savedVariants = () => this.store.savedVariants();
    save = (variant: SpiderVariant, game: SavedSpiderGame) => this.store.save(variant, game);
    clear = (variant: SpiderVariant) => this.store.clear(variant);
}
