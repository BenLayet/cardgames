import type {Card, Suit} from "../model/deck.model.ts";
import {isSavedSpiderGame, type SavedSpiderGame, type SpiderCard, type Table} from "../model/spider.model.ts";
import {isStoredObject, migrate, type Migration} from "./migrations.ts";

// A saved game keeps every table since the deal for the undo, so each table is written as a short text:
// cards as "KS+12" (card, face up or down, id), separated by commas,
// columns separated by "|", then ";" the stock, ";" the suits of the completed sequences.
// It takes about 650 characters per table, against about 4000 in plain JSON.
type EncodedGame = { format: 2, table: string, history: string[], moveCount: number };

const encodeCards = (cards: SpiderCard[]) => cards.map(c => `${c.card}${c.faceUp ? "+" : "-"}${c.id}`).join(",");
const encodeTable = (table: Table) =>
    [table.columns.map(encodeCards).join("|"), encodeCards(table.stock), table.completed.join("")].join(";");

const decodeCards = (text: string): SpiderCard[] => text === "" ? [] : text.split(",").map(code => ({
    card: code.slice(0, 2) as Card,
    faceUp: code.charAt(2) === "+",
    id: Number(code.slice(3)),
}));
const decodeTable = (text: string): Table => {
    const [columns = "", stock = "", completed = ""] = text.split(";");
    return {
        columns: columns.split("|").map(decodeCards),
        stock: decodeCards(stock),
        completed: completed.split("").filter(suit => suit !== "") as Suit[],
    };
};

const encode = (game: SavedSpiderGame): EncodedGame => ({
    format: 2,
    table: encodeTable(game.table),
    history: game.history.map(encodeTable),
    moveCount: game.moveCount,
});

class NotASavedGame extends Error {
}

// Each change of the saved game adds a migration at the end; the format field gives the version of a saved game
const MIGRATIONS: readonly (Migration | undefined)[] = [
    // there was no version 0: the first games were saved as plain JSON, without a format field, and are version 1
    undefined,
    // 1 → 2: the tables are written as short texts
    game => {
        if (!isSavedSpiderGame(game)) throw new NotASavedGame();
        return encode(game);
    },
];

export const encodeSavedGame = (game: SavedSpiderGame): string => JSON.stringify(encode(game));

const isEncodedGame = (data: Record<string, unknown>): data is EncodedGame => data.format === 2
    && typeof data.table === "string"
    && Array.isArray(data.history) && data.history.every(t => typeof t === "string");

// null when the text is not a saved game; a game saved in an earlier format is still read
export const decodeSavedGame = (text: string): SavedSpiderGame | null => {
    try {
        const parsed: unknown = JSON.parse(text);
        if (!isStoredObject(parsed)) return null;
        const encoded = migrate(parsed, Number(parsed.format ?? 1), MIGRATIONS);
        if (encoded === null || !isEncodedGame(encoded)) return null;
        const game: unknown = {table: decodeTable(encoded.table), history: encoded.history.map(decodeTable), moveCount: encoded.moveCount};
        return isSavedSpiderGame(game) ? game : null;
    } catch {
        return null;
    }
};
