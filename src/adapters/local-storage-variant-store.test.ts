import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";

import {LocalStorageVariantStore} from "./local-storage-variant-store.ts";

type Game = { moves: number[] };
const options = {
    name: "test",
    storageKey: (variant: number) => `test.game.${variant}`,
    variantOfKey: (key: string) => /^test\.game\.(\d+)$/.test(key) ? Number(key.split(".")[2]) : null,
    encode: (game: Game) => JSON.stringify(game),
    decode: (text: string) => {
        try {
            return JSON.parse(text) as Game;
        } catch {
            return null;
        }
    },
};

describe("games kept by variant in the browser", () => {
    let stored: Map<string, string>;
    let capacity: number;
    beforeEach(() => {
        stored = new Map();
        capacity = Infinity;
        vi.stubGlobal("localStorage", {
            getItem: (key: string) => stored.get(key) ?? null,
            setItem: (key: string, value: string) => {
                if (value.length > capacity) throw new Error("full");
                stored.set(key, value);
            },
            removeItem: (key: string) => stored.delete(key),
            key: (index: number) => [...stored.keys()][index] ?? null,
            get length() {
                return stored.size;
            },
        });
        vi.spyOn(console, "error").mockImplementation(() => undefined);
    });
    afterEach(() => {
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    it("keeps one game for each variant, and lists only its own keys", () => {
        stored.set("other.key", "x");
        const store = new LocalStorageVariantStore(options);
        store.save(1, {moves: [1]});
        store.save(2, {moves: [2]});
        store.clear(1);

        expect(store.savedVariants()).toEqual([2]);
        expect(store.load(2)).toEqual({moves: [2]});
        expect(store.load(1)).toBeNull();
    });

    it("tries a smaller game when the storage is full, and gives up without failing", () => {
        const store = new LocalStorageVariantStore({...options, shrink: (game: Game) => game.moves.length === 0 ? null : {moves: game.moves.slice(1)}});
        capacity = JSON.stringify({moves: [3, 4]}).length;
        store.save(1, {moves: [1, 2, 3, 4]});
        expect(store.load(1)).toEqual({moves: [3, 4]});

        capacity = 0;
        expect(() => store.save(2, {moves: [1]})).not.toThrow();
        expect(store.load(2)).toBeNull();
    });

    it("moves the single game saved before to the key of its variant, without replacing a game there", () => {
        stored.set("test.game", JSON.stringify({moves: [7]}));
        stored.set("test.game.7", JSON.stringify({moves: [8]}));
        const store = new LocalStorageVariantStore({...options, legacy: {key: "test.game", variantOf: (game: Game) => game.moves[0]}});

        expect(stored.has("test.game")).toBe(false);
        expect(store.load(7)).toEqual({moves: [8]});
    });

    it("keeps nothing and does not fail without storage", () => {
        vi.stubGlobal("localStorage", undefined);
        const store = new LocalStorageVariantStore({...options, legacy: {key: "test.game", variantOf: () => 1}});
        expect(() => store.save(1, {moves: []})).not.toThrow();
        expect(store.load(1)).toBeNull();
        expect(store.savedVariants()).toEqual([]);
        expect(() => store.clear(1)).not.toThrow();
    });
});
