import type {Card, Suit} from "../model/deck.model.ts";
import {isSavedSpiderGame, type SavedSpiderGame, type SpiderCard, type Table} from "../model/spider.model.ts";

// A saved game keeps every table since the deal for the undo, so each table is written as a short text:
// cards as "KS+12" (card, face up or down, id), separated by commas,
// columns separated by "|", then ";" the stock, ";" the suits of the completed sequences.
// It takes about 650 characters per table, against about 4000 in plain JSON.
const FORMAT = 2;

type EncodedGame = { format: typeof FORMAT, table: string, history: string[], moveCount: number };

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

export const encodeSavedGame = (game: SavedSpiderGame): string => JSON.stringify({
    format: FORMAT,
    table: encodeTable(game.table),
    history: game.history.map(encodeTable),
    moveCount: game.moveCount,
} satisfies EncodedGame);

// null when the text is not a saved game; a game saved as plain JSON by an earlier version is still read
export const decodeSavedGame = (text: string): SavedSpiderGame | null => {
    try {
        const parsed = JSON.parse(text) as unknown;
        const encoded = parsed as Partial<EncodedGame> | null;
        const game: unknown = encoded?.format === FORMAT
            && typeof encoded.table === "string"
            && Array.isArray(encoded.history) && encoded.history.every(t => typeof t === "string")
            ? {table: decodeTable(encoded.table), history: encoded.history.map(decodeTable), moveCount: encoded.moveCount}
            : parsed;
        return isSavedSpiderGame(game) ? game : null;
    } catch {
        return null;
    }
};
