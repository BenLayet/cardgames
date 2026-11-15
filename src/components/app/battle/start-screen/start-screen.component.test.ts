import {describe, expect, it} from "vitest";
import {initTestStore} from "@softer-components/utils/test-utilities";

import {startScreenDef} from "./start-screen.component.ts";
import {fakeSettingsService} from "../../../../test/fakes.ts";

const setup = (settings = {}) => {
    const settingsService = fakeSettingsService(settings);
    const store = initTestStore(startScreenDef({settingsService}));
    return {settingsService, store};
};

describe("start screen", () => {
    it("starts with the stored settings", () => {
        const {store} = setup({cardCount: 16});
        expect(store.getValues("").cardCount()).toBe(16);
    });

    it("ignores a stored card count that is no longer offered", () => {
        const {store} = setup({cardCount: 20});
        expect(store.getValues("").cardCount()).toBe(32);
    });

    it("remembers the chosen card count", async () => {
        const {store, settingsService} = setup();
        await store.when({name: "setCardCountRequested", payload: 52, statePath: []});
        expect(store.getValues("").cardCount()).toBe(52);
        expect(settingsService.load().cardCount).toBe(52);
    });
});
