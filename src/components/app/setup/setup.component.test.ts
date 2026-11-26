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
    it("says what each number of cards and of suits changes in Spider", () => {
        const {values} = setup({}, gameDefinition("spider"));
        expect(values().cardCountOptions()).toEqual([26, 52, 104]);
        expect(values().cardCountHints()).toEqual(["short", "medium", "long"]);
        expect(values().suitCountHints()).toEqual(["easy", "normal", "hard"]);
    });

    it("says nothing about the options of a game without hints", () => {
        const {values} = setup();
        expect(values().cardCountHints()).toEqual([null, null, null, null]);
    });

    it("starts with the stored card count", () => {
        const {values} = setup({cardCounts: {bataille: 16}});
        expect(values().cardCount()).toBe(16);
    });

    it("ignores a stored card count that is no longer offered", () => {
        const {values} = setup({cardCounts: {bataille: 20}});
        expect(values().cardCount()).toBe(32);
    });

    it("remembers the chosen card count", async () => {
        const {store, values, settingsService} = setup();
        await store.when({name: "setCardCountRequested", payload: 52, statePath: []});
        expect(values().cardCount()).toBe(52);
        expect(settingsService.load().cardCounts).toEqual({bataille: 52, spider: 104});
    });

    it("keeps a card count for each game", async () => {
        const {store, values, settingsService} = setup({cardCounts: {bataille: 52}}, gameDefinition("spider"));
        expect(values().cardCount()).toBe(104);
        await store.when({name: "setCardCountRequested", payload: 52, statePath: []});
        await store.when({name: "setCardCountRequested", payload: 104, statePath: []});
        expect(settingsService.load().cardCounts).toEqual({bataille: 52, spider: 104});
    });

    it("remembers the chosen number of suits", async () => {
        const {store, values, settingsService} = setup({}, gameDefinition("spider"));
        expect(values().suitCount()).toBe(1);
        await store.when({name: "setSuitCountRequested", payload: 4, statePath: []});
        expect(values().suitCount()).toBe(4);
        expect(settingsService.load().suitCount).toBe(4);
    });

    it("plays 26 cards with one or two suits only", async () => {
        const {store, values} = setup({suitCount: 4}, gameDefinition("spider"));
        expect(values().availableSuitCounts()).toEqual([true, true, true]);
        await store.when({name: "setCardCountRequested", payload: 26, statePath: []});
        expect(values().suitCount()).toBe(2);
        expect(values().availableSuitCounts()).toEqual([true, true, false]);
        await store.when({name: "setSuitCountRequested", payload: 4, statePath: []});
        expect(values().suitCount()).toBe(2);
    });

    it("starts 26 cards stored with four suits with two suits", () => {
        const {values} = setup({suitCount: 4, cardCounts: {spider: 26}}, gameDefinition("spider"));
        expect(values().suitCount()).toBe(2);
    });

    it("ignores a stored number of suits that is not offered", () => {
        const {values} = setup({suitCount: 3}, gameDefinition("spider"));
        expect(values().suitCount()).toBe(1);
    });

    it("plays the battle against the computer by default", () => {
        const {values} = setup();
        expect(values().seats()).toEqual(["human", "computer"]);
        expect(values().isSolo()).toBe(true);
        expect(values().humanCount()).toBe(1);
    });

    it("offers Solo or 2 to 6 human players in the battle, and remembers the choice", async () => {
        const {store, values, settingsService} = setup();
        expect(values().isSoloOrHumans()).toBe(true);
        expect(values().humanCountOptions()).toEqual([1, 2, 3, 4, 5, 6]);

        await store.when({name: "setPlayersRequested", payload: 4, statePath: []});
        expect(values().seats()).toEqual(["human", "human", "human", "human"]);
        expect(values().isSolo()).toBe(false);
        expect(settingsService.load().seats.bataille).toEqual(["human", "human", "human", "human"]);

        await store.when({name: "setPlayersRequested", payload: 1, statePath: []});
        expect(values().seats()).toEqual(["human", "computer"]);
    });

    it("leaves out the numbers of cards that give fewer than 4 cards to each player", async () => {
        const {store, values, settingsService} = setup({cardCounts: {bataille: 16}});
        await store.when({name: "setPlayersRequested", payload: 5, statePath: []});

        expect(values().availableCardCounts()).toEqual([false, false, true, true]);
        expect(values().cardCount()).toBe(32);
        expect(settingsService.load().cardCounts.bataille).toBe(32);
        await store.when({name: "setCardCountRequested", payload: 12, statePath: []});
        expect(values().cardCount()).toBe(32);
    });

    it("says how many cards each player gets, and how many are set aside", async () => {
        const {store, values} = setup({cardCounts: {bataille: 52}});
        await store.when({name: "setPlayersRequested", payload: 5, statePath: []});
        expect(values().cardsPerPlayer()).toBe(10);
        expect(values().setAsideCount()).toBe(2);
    });

    it("starts with a number of cards that the stored players can play", () => {
        const {values} = setup({cardCounts: {bataille: 12}, seats: {bataille: ["human", "human", "human", "human", "human", "human"]}});
        expect(values().cardCount()).toBe(32);
    });

    it("ignores stored seats that mix humans and the computer in the battle", () => {
        const {values} = setup({seats: {bataille: ["human", "human", "computer"]}});
        expect(values().seats()).toEqual(["human", "computer"]);
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

    it("remembers the names of the players for every game", async () => {
        const {store, values, settingsService} = setup();
        await store.when({name: "renamePlayerRequested", payload: {index: 1, name: "Léa"}, statePath: []});
        expect(values().playerNames()).toEqual(["", "Léa"]);
        expect(settingsService.load().playerNames).toEqual(["", "Léa"]);
        // the computer plays under the name typed for it, and keeps it as a human
        expect(values().seatNames()).toEqual([null, "Léa"]);

        await store.when({name: "toggleSeatRequested", payload: 1, statePath: []});
        expect(values().seatNames()).toEqual([null, "Léa"]);
    });

    it("keeps the names of the seats that the game does not show", async () => {
        const {store, settingsService} = setup({playerNames: ["Tom", "Léa", "Zoé"]});
        await store.when({name: "renamePlayerRequested", payload: {index: 0, name: "Max"}, statePath: []});
        expect(settingsService.load().playerNames).toEqual(["Max", "Léa", "Zoé"]);
    });

    it("names a seat after its number when its name is blank", () => {
        const {values} = setup({playerNames: ["  ", "Léa"], seats: {bataille: ["human", "human"]}});
        expect(values().seatNames()).toEqual([null, "Léa"]);
    });

    it("ignores stored names that are not text, and cuts long ones", () => {
        const {values} = setup({playerNames: [42, "A very long name for a seat"] as unknown as string[]});
        expect(values().playerNames()).toEqual(["", "A very long name"]);
    });
});
