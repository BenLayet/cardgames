// How a game keeps one saved game for each kind of game (its variant) in the browser
export type VariantStoreOptions<Variant, Game> = {
    // the name of the game in the error messages
    name: string;
    storageKey: (variant: Variant) => string;
    // the variant stored under a key, null for a key of something else
    variantOfKey: (key: string) => Variant | null;
    encode: (game: Game) => string;
    // null for a stored text that is not a game: it is ignored, as if there was none
    decode: (text: string) => Game | null;
    // where the single game was kept before games were kept by variant, and the variant of such a game
    legacy?: { key: string, variantOf: (game: Game) => Variant };
    // a smaller game to try when the storage is full, null when the game cannot be smaller
    shrink?: (game: Game) => Game | null;
};

// Stores the games in the browser; without storage (private mode, blocked...) the games are simply not kept
export class LocalStorageVariantStore<Variant, Game> {
    private readonly options: VariantStoreOptions<Variant, Game>;

    constructor(options: VariantStoreOptions<Variant, Game>) {
        this.options = options;
        this.moveLegacyGame();
    }

    load(variant: Variant): Game | null {
        try {
            const stored = localStorage.getItem(this.options.storageKey(variant));
            return stored === null ? null : this.options.decode(stored);
        } catch {
            return null;
        }
    }

    savedVariants(): Variant[] {
        try {
            return Array.from({length: localStorage.length}, (_, index) => localStorage.key(index))
                .flatMap(key => {
                    const variant = key === null ? null : this.options.variantOfKey(key);
                    return variant === null ? [] : [variant];
                });
        } catch {
            return [];
        }
    }

    save(variant: Variant, game: Game): void {
        const {storageKey, encode, shrink, name} = this.options;
        let current: Game | null = game;
        while (current !== null) {
            try {
                localStorage.setItem(storageKey(variant), encode(current));
                return;
            } catch (error) {
                current = shrink?.(current) ?? null;
                if (current === null) console.error(`Failed to save the ${name} game:`, error);
            }
        }
    }

    clear(variant: Variant): void {
        try {
            localStorage.removeItem(this.options.storageKey(variant));
        } catch (error) {
            console.error(`Failed to clear the ${this.options.name} game:`, error);
        }
    }

    // the single game saved before goes to the key of its variant, once when the application starts
    private moveLegacyGame(): void {
        const {legacy, storageKey, encode, decode} = this.options;
        if (!legacy) return;
        try {
            const stored = localStorage.getItem(legacy.key);
            if (stored === null) return;
            const game = decode(stored);
            if (game !== null) {
                const key = storageKey(legacy.variantOf(game));
                if (localStorage.getItem(key) === null) localStorage.setItem(key, encode(game));
            }
            localStorage.removeItem(legacy.key);
        } catch {
            // the legacy game is simply not kept
        }
    }
}
