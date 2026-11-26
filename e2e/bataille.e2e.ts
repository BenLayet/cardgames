import {expect, type Page, test} from "@playwright/test";

const seat = (pile: string[], extra = {}) => ({pile, played: [], playedUp: [], rank: null, eliminatedRound: null, ...extra});

// a game between 4 humans, the last one already out: each player has a single card left
const lastRound = {
    version: 2,
    seats: [seat(["4S"]), seat(["2H", "AH"]), seat(["5D"]), seat([], {rank: 4, eliminatedRound: 7})],
    contenders: [0, 1, 2], step: "up", battleCount: 0, roundNumber: 12, lastRoundWinner: 1, lastWonCount: 3, setAsideCount: 0,
    hasPlayed: true, isSolo: false, playerNames: ["Ben", "Léa", "Tom", "Inès"],
};

const resume = async (page: Page, game: object) => {
    await page.addInitScript(saved => {
        localStorage.setItem("cardgames.settings", JSON.stringify({schemaVersion: 3, language: "fr"}));
        localStorage.setItem("cardgames.bataille.game", JSON.stringify(saved));
    }, game);
    await page.goto("/");
    await page.getByText("Bataille").first().click();
    await page.getByRole("button", {name: "Reprendre la partie"}).click();
};

test("each player plays with their own key, and the end screen ranks every player", async ({page}) => {
    await resume(page, lastRound);
    await expect(page.getByRole("status")).toHaveText("Léa remporte 3 cartes");

    await page.keyboard.press("l");
    await expect(page.getByRole("status")).toHaveText("À jouer : Léa, Tom");
    await page.keyboard.press("a");
    await page.keyboard.press("g");

    await expect(page.getByRole("heading", {name: "Léa a gagné !"})).toBeVisible();
    await expect(page.locator(".battle-ranking li")).toHaveText([/1er.*Léa/, /2e.*Ben.*tour 12/, /2e.*Tom.*tour 12/, /4e.*Inès.*tour 7/]);
});

test("the setup screen offers Solo or 2 to 6 players, and leaves out decks too small for them", async ({page}) => {
    await page.addInitScript(() => {
        localStorage.setItem("cardgames.settings", JSON.stringify({schemaVersion: 3, language: "fr"}));
    });
    await page.goto("/");
    await page.getByText("Bataille").first().click();
    await expect(page.getByText("Tu joues contre l'ordinateur.")).toBeVisible();

    await page.getByRole("button", {name: "6 joueurs"}).click();
    await expect(page.getByRole("textbox")).toHaveCount(6);
    await expect(page.getByRole("button", {name: "16"})).toBeDisabled();
    await expect(page.getByText("5 cartes chacun · 2 mises de côté")).toBeVisible();

    await page.getByRole("button", {name: "Commencer"}).click();
    await expect(page.locator(".battle-pile")).toHaveCount(6);
});
