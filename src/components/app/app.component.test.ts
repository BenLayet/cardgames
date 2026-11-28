import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {initTestStore, type TestStore} from "@softer-components/test-utilities";

import {appDef, type AppContract} from "./app.component.ts";
import {fakeAudioService, fakeBattleSaveService, fakeSettingsService, fakeSpiderSaveService, fakeSpiderRecordsService, fakeClockService} from "../../test/fakes.ts";
import {TimeoutSchedulerAdapter} from "../../adapters/scheduler.adapter.ts";

const setupPath: [string, string][] = [["battle", "0"], ["setup", "0"]];
let store: TestStore<AppContract>;

beforeEach(() => {
    vi.useFakeTimers();
    store = initTestStore(appDef({
        audioService: fakeAudioService(),
        settingsService: fakeSettingsService(),
        schedulerService: new TimeoutSchedulerAdapter(),
        languageService: {setLanguage: vi.fn()},
        spiderSaveService: fakeSpiderSaveService(),
        spiderRecordsService: fakeSpiderRecordsService(),
        clockService: fakeClockService(),
        battleSaveService: fakeBattleSaveService(),
    }));
});
afterEach(() => {
    vi.useRealTimers();
});

describe("app", () => {
    it("opens on the home page", () => {
        expect(store.getValues("").page()).toBe("HOME");
    });

    it("opens the setup of the chosen game, and goes back to the home page", async () => {
        await store.when({name: "gameSelected", payload: "bataille", statePath: []});
        expect(store.getValues("").page()).toBe("bataille");

        await store.when({name: "backRequested", statePath: setupPath});
        expect(store.getValues("").page()).toBe("HOME");
    });

    it("stays on the home page when the chosen game is not playable yet", async () => {
        await store.when({name: "gameSelected", payload: "crapette", statePath: []});
        expect(store.getValues("").page()).toBe("HOME");
    });

    it("opens the spider solitaire and goes back to the home page from its setup", async () => {
        await store.when({name: "gameSelected", payload: "spider", statePath: []});
        expect(store.getValues("").page()).toBe("spider");

        await store.when({name: "backRequested", statePath: [["spider", "0"], ["setup", "0"]]});
        expect(store.getValues("").page()).toBe("HOME");
    });
});
