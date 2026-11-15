import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {initTestStore} from "@softer-components/utils/test-utilities";

import {appDef} from "./app.component.ts";
import {fakeAudioService, fakeSettingsService} from "../../test/fakes.ts";
import {TimeoutSchedulerAdapter} from "../../adapters/scheduler.adapter.ts";

beforeEach(() => {
    vi.useFakeTimers();
});
afterEach(() => {
    vi.useRealTimers();
});

describe("app", () => {
    it("only offers the settings on the home screen", async () => {
        const store = initTestStore(appDef({
            audioService: fakeAudioService(),
            settingsService: fakeSettingsService(),
            schedulerService: new TimeoutSchedulerAdapter(),
            languageService: {setLanguage: vi.fn()},
        }));
        expect(store.getValues("").areSettingsAvailable()).toBe(true);

        await store.when({name: "startGameRequested", statePath: [["battle", "0"], ["startScreen", "0"]]});

        expect(store.getValues("").areSettingsAvailable()).toBe(false);
    });
});
