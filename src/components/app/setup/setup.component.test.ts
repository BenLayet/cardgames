import {describe, expect, it} from "vitest";
import {initTestStore} from "@softer-components/test-utilities";

import {setupDef} from "./setup.component.ts";
import {fakeSettingsService} from "../../../test/fakes.ts";
import {type GameDefinition, gameDefinition} from "../../../model/games.model.ts";
import type {Settings} from "../../../services/settings.service.ts";

const upToFour: GameDefinition = {
    id: "pouilleux", minPlayers: 2, maxPlayers: 4, computerOpponents: true, available: true, cardCountOptions: [], suitCountOptions: [],
};

const setup = (settings: Partial<Settings> = {}, game = gameDefinition("bataille")) => {
    const settingsService = fakeSettingsService(settings);
    const store = initTestStore(setupDef(game, {settingsService}));
    return {settingsService, store, values: () => store.getValues("")};
};

describe("setup screen", () => {
    it("starts with the stored card count", () => {
        const {values} = setup({cardCount: 16});
        expect(values().cardCount()).toBe(16);
    });

    it("ignores a stored card count that is no longer offered", () => {
        const {values} = setup({cardCount: 20});
        expect(values().cardCount()).toBe(32);
    });

    it("remembers the chosen card count", async () => {
        const {store, values, settingsService} = setup();
        await store.when({name: "setCardCountRequested", payload: 52, statePath: []});
        expect(values().cardCount()).toBe(52);
        expect(settingsService.load().cardCount).toBe(52);
    });

    it("remembers the chosen number of suits", async () => {
        const {store, values, settingsService} = setup({}, gameDefinition("spider"));
        expect(values().suitCount()).toBe(1);
        await store.when({name: "setSuitCountRequested", payload: 4, statePath: []});
        expect(values().suitCount()).toBe(4);
        expect(settingsService.load().suitCount).toBe(4);
    });

    it("ignores a stored number of suits that is not offered", () => {
        const {values} = setup({suitCount: 3}, gameDefinition("spider"));
        expect(values().suitCount()).toBe(1);
    });

    it("plays the battle against the computer by default", () => {
        const {values} = setup();
        expect(values().seats()).toEqual(["human", "computer"]);
        expect(values().isPlayerCountFixed()).toBe(true);
    });

    it("lets a second human take the seat of the computer, and remembers it", async () => {
        const {store, values, settingsService} = setup();
        await store.when({name: "toggleSeatRequested", payload: 1, statePath: []});
        expect(values().seats()).toEqual(["human", "human"]);
        expect(settingsService.load().seats.bataille).toEqual(["human", "human"]);
    });

    it("never gives the first seat to the computer", async () => {
        const {store, values} = setup();
        await store.when({name: "toggleSeatRequested", payload: 0, statePath: []});
        expect(values().seats()).toEqual(["human", "computer"]);
    });

    it("ignores stored seats that the game does not allow", () => {
        const {values} = setup({seats: {bataille: ["human", "computer", "computer"]}});
        expect(values().seats()).toEqual(["human", "computer"]);
    });

    it("keeps the player count within the range of the game", async () => {
        const {store, values} = setup({}, upToFour);
        expect(values().canRemovePlayer()).toBe(false);
        for (let i = 0; i < 3; i++) await store.when({name: "addPlayerRequested", statePath: []});
        expect(values().playerCount()).toBe(4);
        expect(values().canAddPlayer()).toBe(false);

        await store.when({name: "removePlayerRequested", statePath: []});
        expect(values().seats()).toEqual(["human", "computer", "computer"]);
    });
});
