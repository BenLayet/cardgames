import {expect, type Page, test} from "@playwright/test";

// Spider on screen: the cards moved by the pointer, their flight, and the end of a game.
// Each test resumes a game saved in the browser, so that the cards on the table are known.

type SpiderCard = { id: number, card: string, faceUp: boolean };
type Table = { columns: SpiderCard[][], stock: SpiderCard[], completed: string[] };

let nextId = 0;
// "5S" is face up, "_5S" face down
const cards = (...codes: string[]): SpiderCard[] => codes.map(code => ({
    id: nextId++,
    card: code.replace("_", ""),
    faceUp: !code.startsWith("_"),
}));

// 104 cards of one suit: 6 completed sequences (78 cards), 11 cards in the columns and 15 in the stock.
// The 8 can go on either 9, or on the empty column 3; the queen can only go on the king.
const PLAYING: Table = {
    columns: [
        cards("_5S", "8S"),
        cards("9S"),
        cards("9S"),
        [],
        cards("_2S", "QS"),
        cards("KS"),
        cards("AS"), cards("AS"), cards("AS"), cards("AS"),
    ],
    stock: cards(...Array.from({length: 15}, () => "_3S")),
    completed: Array.from({length: 6}, () => "S"),
};

// 104 cards of one suit: 7 completed sequences, the last one is completed by putting the ace on the 2
const ALMOST_WON: Table = {
    columns: [
        cards(..."KQJT98765432".split("").map(rank => `${rank}S`)),
        cards("AS"),
        [], [], [], [], [], [], [], [],
    ],
    stock: [],
    completed: Array.from({length: 7}, () => "S"),
};

const resume = async (page: Page, table: Table) => {
    await page.addInitScript(saved => {
        localStorage.setItem("cardgames.settings", JSON.stringify({schemaVersion: 3, language: "fr"}));
        // a game saved in the first format, plain JSON, which every version reads
        localStorage.setItem("cardgames.spider.game.104.1", JSON.stringify({table: saved, history: [], moveCount: 0}));
    }, table);
    await page.goto("/");
    await page.getByText("Spider").first().click();
    await page.getByRole("button", {name: "Reprendre la partie"}).click();
    await expect(page.locator("[data-column]")).toHaveCount(10);
};

const card = (page: Page, column: number, index: number) => page.locator(`[data-column="${column}"] [data-index="${index}"]`);
const column = (page: Page, index: number) => page.locator(`[data-column="${index}"]`);
const cardsIn = (page: Page, index: number) => column(page, index).locator("[data-index]");

test("cards dragged onto a column that takes them move there", async ({page}) => {
    await resume(page, PLAYING);
    const from = await card(page, 0, 1).boundingBox();
    const to = await card(page, 1, 0).boundingBox();
    if (!from || !to) throw new Error("cards not laid out");
    await page.mouse.move(from.x + from.width / 2, from.y + 10);
    await page.mouse.down();
    await page.mouse.move(to.x + to.width / 2, to.y + to.height / 2, {steps: 10});
    await page.mouse.up();
    await expect(cardsIn(page, 1)).toHaveCount(2);
    await expect(cardsIn(page, 0)).toHaveCount(1);
});

test("a clicked card that can only go to one column goes there right away", async ({page}) => {
    await resume(page, PLAYING);
    await card(page, 4, 1).click();
    await expect(cardsIn(page, 5)).toHaveCount(2);
    await expect(cardsIn(page, 4)).toHaveCount(1);
});

test("a clicked card that can go to several columns waits for one of them, an empty one too", async ({page}) => {
    await resume(page, PLAYING);
    await card(page, 0, 1).click();
    await expect(page.getByText("Touche une colonne bleue")).toBeVisible();
    for (const destination of [1, 2]) await expect(column(page, destination)).toHaveClass(/spider-column--destination/);
    await column(page, 3).click();
    await expect(cardsIn(page, 3)).toHaveCount(1);
    await expect(cardsIn(page, 0)).toHaveCount(1);
});

test("a hint raises the cards to move and shows their columns in blue, as a click would", async ({page}) => {
    await resume(page, PLAYING);
    await page.getByRole("button", {name: "Indice"}).click();
    await expect(card(page, 0, 1)).toHaveClass(/spider-card--selected/);
    for (const destination of [1, 2, 3]) await expect(column(page, destination)).toHaveClass(/spider-column--destination/);
    await column(page, 1).click();
    await expect(cardsIn(page, 1)).toHaveCount(2);
    await expect(cardsIn(page, 0)).toHaveCount(1);
});

test("a moved card flies straight from where it was to where it goes", async ({page}) => {
    await resume(page, PLAYING);
    const queen = page.locator(`[data-column="4"] [data-index="1"]`);
    const id = await queen.getAttribute("data-card-id");
    // where the card is drawn at each frame, from the click on
    await page.evaluate(cardId => {
        const samples: { x: number, y: number }[] = [];
        Object.assign(window, {flightSamples: samples});
        const sample = () => {
            const rect = document.querySelector(`[data-card-id="${cardId}"]`)?.getBoundingClientRect();
            if (rect) samples.push({x: rect.left, y: rect.top});
            if (samples.length < 90) requestAnimationFrame(sample);
        };
        requestAnimationFrame(sample);
    }, id);
    const before = await queen.boundingBox();
    await queen.click();
    await page.waitForTimeout(800);
    const after = await page.locator(`[data-card-id="${id}"]`).boundingBox();
    const samples = await page.evaluate(() => (window as unknown as { flightSamples: { x: number, y: number }[] }).flightSamples);
    if (!before || !after) throw new Error("card not laid out");
    expect(after.x).toBeGreaterThan(before.x + 10);
    const between = (value: number, a: number, b: number) => value >= Math.min(a, b) - 2 && value <= Math.max(a, b) + 2;
    // never anywhere else than between its two places
    for (const {x, y} of samples) {
        expect(between(x, before.x, after.x)).toBe(true);
        expect(between(y, before.y, after.y)).toBe(true);
    }
    // and seen on its way, not only at both ends
    const onTheWay = samples.filter(({x}) => Math.abs(x - before.x) > 2 && Math.abs(x - after.x) > 2);
    expect(onTheWay.length).toBeGreaterThan(2);
});

test("a completed sequence flies away with the ace on top and the king beneath", async ({page}) => {
    await resume(page, ALMOST_WON);
    await card(page, 1, 0).click();
    const flying = page.locator(".card-flight-layer > *");
    await expect(flying).toHaveCount(13);
    // later in the layer is drawn above: from the king (12) at the bottom to the ace (0) on top
    const ranks = await flying.evaluateAll(elements => elements.map(element => Number((element as HTMLElement).dataset.rank)));
    expect(ranks).toEqual([12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0]);
});

test("the victory shows once the last sequence has reached its place", async ({page}) => {
    await resume(page, ALMOST_WON);
    // each frame, whether the sequence is still flying and whether the victory is on screen
    await page.evaluate(() => {
        const frames: { flying: boolean, victory: boolean }[] = [];
        (window as unknown as { victoryFrames: typeof frames }).victoryFrames = frames;
        const sample = () => {
            frames.push({
                flying: document.querySelector(".card-flight-layer") !== null,
                victory: Array.from(document.querySelectorAll("h1"), (h: HTMLElement) => h.textContent).includes("Victoire"),
            });
            if (frames.length < 240) requestAnimationFrame(sample);
        };
        requestAnimationFrame(sample);
    });
    await card(page, 1, 0).click();
    await expect(page.getByRole("heading", {name: "Victoire"})).toBeVisible();
    const frames = await page.evaluate(() => (window as unknown as { victoryFrames: { flying: boolean, victory: boolean }[] }).victoryFrames);
    expect(frames.some(frame => frame.flying)).toBe(true);
    expect(frames.some(frame => frame.flying && frame.victory)).toBe(false);
});

test.describe("on a touch screen", () => {
    test.use({hasTouch: true});

    // on a touch screen, the click that follows a tap lands on what is under the finger once the tap is handled
    test("the tap that wins the game leaves the victory on screen, the next one closes it", async ({page}) => {
        await resume(page, ALMOST_WON);
        await card(page, 1, 0).tap();
        const victory = page.getByRole("heading", {name: "Victoire"});
        await expect(victory).toBeVisible();
        await page.waitForTimeout(500);
        await expect(victory).toBeVisible();
        await victory.tap();
        await expect(victory).toBeHidden();
    });
});
