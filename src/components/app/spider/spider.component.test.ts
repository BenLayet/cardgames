import {beforeEach, describe, expect, it} from "vitest";
import {initTestStore, type TestStore} from "@softer-components/test-utilities";

import {spiderDef, type SpiderContract} from "./spider.component.ts";
import {fakeAudioService, fakeSettingsService, fakeSpiderSaveService} from "../../../test/fakes.ts";

const setupPath: [string, string][] = [["setup", "0"]];
const gamePath: [string, string][] = [["game", "0"]];

let audioService: ReturnType<typeof fakeAudioService>;
let store: TestStore<SpiderContract>;

beforeEach(() => {
    audioService = fakeAudioService();
    store = initTestStore(spiderDef({
        audioService,
        settingsService: fakeSettingsService({suitCount: 4}),
        spiderSaveService: fakeSpiderSaveService(),
    }));
});

describe("spider", () => {
    it("starts a game with the number of suits chosen on the setup screen", async () => {
        await store.when({name: "startGameRequested", statePath: setupPath});

        expect(store.getValues("").isStarted()).toBe(true);
        const suits = new Set(store.getValues("/game").columns().flat().map(c => c.card.charAt(1)));
        expect(suits.size).toBe(4);
    });

    it("goes back to the setup screen when the player wants the menu at the end of a game", async () => {
        await store.when({name: "startGameRequested", statePath: setupPath});

        await store.when({name: "menuRequested", statePath: gamePath});

        expect(store.getValues("").isStarted()).toBe(false);
    });

    it("deals a new game with the same options when the player wants to play again", async () => {
        await store.when({name: "startGameRequested", statePath: setupPath});
        await store.when({name: "gameEnded", statePath: gamePath});

        await store.when({name: "playAgainRequested", statePath: gamePath});

        expect(store.getValues("").isStarted()).toBe(true);
        expect(store.getValues("/game").hasGameEnded()).toBe(false);
        expect(new Set(store.getValues("/game").columns().flat().map(c => c.card.charAt(1))).size).toBe(4);
    });

    it("offers to resume a saved game, and resumes it", async () => {
        const spiderSaveService = fakeSpiderSaveService();
        const first = initTestStore(spiderDef({audioService, settingsService: fakeSettingsService(), spiderSaveService}));
        expect(first.getValues("").canResume()).toBe(false);
        await first.when({name: "startGameRequested", statePath: setupPath});
        // a game is kept from its first move: a row dealt from the stock
        await first.when({name: "stockClicked", statePath: gamePath});
        const dealt = first.getValues("/game").columns();

        // the application is started again
        const next = initTestStore(spiderDef({audioService, settingsService: fakeSettingsService(), spiderSaveService}));
        expect(next.getValues("").canResume()).toBe(true);
        await next.when({name: "resumeRequested", statePath: []});

        expect(next.getValues("").isStarted()).toBe(true);
        expect(next.getValues("/game").columns()).toEqual(dealt);
    });

    it("no longer offers to resume a game that was won", async () => {
        await store.when({name: "startGameRequested", statePath: setupPath});
        expect(store.getValues("").canResume()).toBe(false);
        await store.when({name: "gameEnded", statePath: gamePath});
        await store.when({name: "menuRequested", statePath: gamePath});

        expect(store.getValues("").canResume()).toBe(false);
    });

    it("offers to resume the game left by going home", async () => {
        await store.when({name: "startGameRequested", statePath: setupPath});
        await store.when({name: "stockClicked", statePath: gamePath});
        await store.when({name: "goHomeRequested", statePath: []});

        expect(store.getValues("").canResume()).toBe(true);
    });

    it("does not offer to resume a game left before its first move, and the new game replaces the one to resume", async () => {
        await store.when({name: "startGameRequested", statePath: setupPath});
        await store.when({name: "stockClicked", statePath: gamePath});
        await store.when({name: "goHomeRequested", statePath: []});

        await store.when({name: "startGameRequested", statePath: setupPath});
        await store.when({name: "goHomeRequested", statePath: []});

        expect(store.getValues("").canResume()).toBe(false);
    });

    it("keeps one game for each number of suits, and resumes the one of the chosen number", async () => {
        const spiderSaveService = fakeSpiderSaveService();
        const spider = initTestStore(spiderDef({audioService, settingsService: fakeSettingsService({suitCount: 1}), spiderSaveService}));
        await spider.when({name: "startGameRequested", statePath: setupPath});
        await spider.when({name: "stockClicked", statePath: gamePath});
        await spider.when({name: "goHomeRequested", statePath: []});
        await spider.when({name: "setSuitCountRequested", payload: 4, statePath: setupPath});
        // no game was started with 4 suits
        expect(spider.getValues("").canResume()).toBe(false);
        await spider.when({name: "startGameRequested", statePath: setupPath});
        await spider.when({name: "stockClicked", statePath: gamePath});
        const fourSuits = spider.getValues("/game").columns();
        await spider.when({name: "goHomeRequested", statePath: []});

        await spider.when({name: "setSuitCountRequested", payload: 1, statePath: setupPath});
        expect(spider.getValues("").canResume()).toBe(true);
        expect(spiderSaveService.savedVariants()).toEqual([{suitCount: 1, cardCount: 104}, {suitCount: 4, cardCount: 104}]);

        await spider.when({name: "setSuitCountRequested", payload: 4, statePath: setupPath});
        await spider.when({name: "resumeRequested", statePath: []});
        expect(spider.getValues("/game").columns()).toEqual(fourSuits);
    });

    it("keeps one game for each number of cards, and deals the chosen number", async () => {
        const spiderSaveService = fakeSpiderSaveService();
        const spider = initTestStore(spiderDef({audioService, settingsService: fakeSettingsService({suitCount: 1}), spiderSaveService}));
        await spider.when({name: "startGameRequested", statePath: setupPath});
        await spider.when({name: "stockClicked", statePath: gamePath});
        await spider.when({name: "goHomeRequested", statePath: []});
        await spider.when({name: "setCardCountRequested", payload: 52, statePath: setupPath});
        expect(spider.getValues("").canResume()).toBe(false);

        await spider.when({name: "startGameRequested", statePath: setupPath});
        expect(spider.getValues("/game").columns()).toHaveLength(8);
        await spider.when({name: "stockClicked", statePath: gamePath});
        await spider.when({name: "goHomeRequested", statePath: []});

        expect(spiderSaveService.savedVariants()).toEqual([{suitCount: 1, cardCount: 104}, {suitCount: 1, cardCount: 52}]);
        await spider.when({name: "resumeRequested", statePath: []});
        expect(spider.getValues("/game").columns()).toHaveLength(8);
    });

    it("forgets only the won game of its number of suits", async () => {
        const spiderSaveService = fakeSpiderSaveService();
        const spider = initTestStore(spiderDef({audioService, settingsService: fakeSettingsService({suitCount: 1}), spiderSaveService}));
        await spider.when({name: "startGameRequested", statePath: setupPath});
        await spider.when({name: "stockClicked", statePath: gamePath});
        await spider.when({name: "goHomeRequested", statePath: []});
        await spider.when({name: "setSuitCountRequested", payload: 2, statePath: setupPath});
        await spider.when({name: "startGameRequested", statePath: setupPath});

        await spider.when({name: "gameEnded", statePath: gamePath});
        await spider.when({name: "menuRequested", statePath: gamePath});

        expect(spider.getValues("").canResume()).toBe(false);
        await spider.when({name: "setSuitCountRequested", payload: 1, statePath: setupPath});
        expect(spider.getValues("").canResume()).toBe(true);
    });
});
