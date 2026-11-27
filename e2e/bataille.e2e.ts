import {expect, type Page, test} from "@playwright/test";

const seat = (pile: string[], extra = {}) => ({pile, played: [], playedUp: [], rank: null, eliminatedRound: null, ...extra});

// a game between 4 humans, the last one already out: each player has a single card left
const lastRound = {
    version: 2,
    seats: [seat(["4S"]), seat(["2H", "AH"]), seat(["5D"]), seat([], {rank: 4, eliminatedRound: 7})],
    // the 12 other cards of the 16 were won by the players or set aside earlier
    contenders: [0, 1, 2], step: "up", battleCount: 0, roundNumber: 12, lastRoundWinner: 1, lastWonCount: 3, setAsideCount: 12,
    hasPlayed: true, isSolo: false, playerNames: ["Ben", "Léa", "Tom", "Inès"],
};

// one game is kept for each kind of game: the players and the number of cards chosen on the menu
const resume = async (page: Page, game: object, players: string, cardCount: string, names: string[] = []) => {
    await page.addInitScript(([saved, key]) => {
        localStorage.setItem("cardgames.settings", JSON.stringify({schemaVersion: 3, language: "fr"}));
        localStorage.setItem(key, JSON.stringify(saved));
    }, [game, `cardgames.bataille.game.${players.split(" ")[0]}.${cardCount}`] as const);
    await page.goto("/");
    await page.getByText("Bataille").first().click();
    await expect(page.getByRole("button", {name: "Reprendre la partie"})).toHaveCount(0);
    await page.getByRole("button", {name: players}).click();
    await page.getByRole("button", {name: cardCount, exact: true}).click();
    // the game goes on with the names typed on the menu
    for (const [index, name] of names.entries()) await page.getByRole("textbox").nth(index).fill(name);
    await page.getByRole("button", {name: "Reprendre la partie"}).click();
};

test("each player plays with their own key, and the end screen ranks every player", async ({page}) => {
    await resume(page, lastRound, "4 joueurs", "16", lastRound.playerNames);
    await expect(page.getByRole("status")).toHaveText("Léa remporte 3 cartes");

    await page.keyboard.press("l");
    await expect(page.getByRole("status")).toHaveText("Au tour de : Léa, Tom");
    await page.keyboard.press("a");
    await page.keyboard.press("g");
    // Léa wins the round: the cards wait for a tap, or a key, before going to her
    await expect(page.getByRole("status")).toHaveText("Léa remporte 3 cartes · touche la table pour ramasser");
    await page.keyboard.press("Space");

    await expect(page.getByRole("heading", {name: "Léa a gagné !"})).toBeVisible();
    await expect(page.locator(".battle-ranking li")).toHaveText([/1er.*Léa/, /2e.*Ben.*tour 12/, /2e.*Tom.*tour 12/, /4e.*Inès.*tour 7/]);
});

test("between two players, the end screen names the winner without a ranking", async ({page}) => {
    // Léa's ace beats Ben's four, and Ben has no card left
    const twoPlayers = {
        version: 2,
        seats: [seat(["4S"]), seat(["2H", "AH"])],
        contenders: [0, 1], step: "up", battleCount: 0, roundNumber: 9, lastRoundWinner: 1, lastWonCount: 2, setAsideCount: 9,
        hasPlayed: true, isSolo: false, playerNames: ["Ben", "Léa"],
    };
    await resume(page, twoPlayers, "2 joueurs", "12", twoPlayers.playerNames);
    await page.keyboard.press("l");
    await page.keyboard.press("a");
    await expect(page.getByRole("status")).toHaveText("Léa remporte 2 cartes · touche la table pour ramasser");
    await page.keyboard.press("Space");

    await expect(page.getByRole("heading", {name: "Léa a gagné !"})).toBeVisible();
    await expect(page.locator(".battle-ranking")).toHaveCount(0);
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

test("alone against the computer, the status line says when it is the player's turn", async ({page}) => {
    // the player's king beats the computer's queen
    const solo = {
        version: 2,
        seats: [seat(["4S", "KS"]), seat(["2H", "QH"])],
        contenders: [0, 1], step: "up", battleCount: 0, roundNumber: 5, lastRoundWinner: 1, lastWonCount: 2, setAsideCount: 8,
        hasPlayed: true, isSolo: true, playerNames: [null, null],
    };
    await page.addInitScript(saved => {
        localStorage.setItem("cardgames.settings", JSON.stringify({schemaVersion: 3, language: "fr"}));
        localStorage.setItem("cardgames.bataille.game.solo.12", JSON.stringify(saved));
    }, solo);
    await page.goto("/");
    await page.getByText("Bataille").first().click();
    await page.getByRole("button", {name: "12", exact: true}).click();
    await page.getByRole("button", {name: "Reprendre la partie"}).click();
    await expect(page.getByRole("status")).toHaveText("L'ordinateur remporte 2 cartes · À ton tour de jouer");

    await page.locator(".battle-table").click();
    await expect(page.getByRole("status")).toHaveText("Tu remportes 2 cartes · touche la table pour ramasser");
    await page.locator(".battle-table").click();
    await expect(page.getByRole("status")).toHaveText("Tu remportes 2 cartes · À ton tour de jouer");
});
