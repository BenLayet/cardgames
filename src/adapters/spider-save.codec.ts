import type {Card, Suit} from "../model/deck.model.ts";
import {isSavedSpiderGame, type SavedPosition, type SavedSpiderGame, type SpiderCard, type Table} from "../model/spider.model.ts";
import {isStoredObject, migrate, type Migration} from "./migrations.ts";

// A saved game keeps every table since the deal for the undo, so each table is written as a short text:
// cards as "KS+12" (card, face up or down, id), separated by commas,
// columns separated by "|", then ";" the stock, ";" the suits of the completed sequences.
// It takes about 650 characters per table, against about 4000 in plain JSON.
// The positions saved by the player are written the same way, each with its own undo history.
type EncodedPosition = { table: string, history: string[], moveCount: number, savedAt: number };
type EncodedGame = { format: 3, table: string, history: string[], moveCount: number, positions: EncodedPosition[] };

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

const encodePosition = (position: SavedPosition): EncodedPosition => ({
    table: encodeTable(position.table),
    history: position.history.map(encodeTable),
    moveCount: position.moveCount,
    savedAt: position.savedAt,
});
const encode = (game: SavedSpiderGame): EncodedGame => ({
    format: 3,
    table: encodeTable(game.table),
    history: game.history.map(encodeTable),
    moveCount: game.moveCount,
    positions: game.positions.map(encodePosition),
});

class NotASavedGame extends Error {
}

// Each change of the saved game adds a migration at the end; the format field gives the version of a saved game
const MIGRATIONS: readonly (Migration | undefined)[] = [
    // there was no version 0: the first games were saved as plain JSON, without a format field, and are version 1
    undefined,
    // 1 → 2: the tables are written as short texts
    game => {
        const withoutPositions = {...game, positions: []};
        if (!isSavedSpiderGame(withoutPositions)) throw new NotASavedGame();
        return {
            format: 2,
            table: encodeTable(withoutPositions.table),
            history: withoutPositions.history.map(encodeTable),
            moveCount: withoutPositions.moveCount,
        };
    },
    // 2 → 3: the positions saved by the player, none before
    game => ({...game, format: 3, positions: []}),
];

export const encodeSavedGame = (game: SavedSpiderGame): string => JSON.stringify(encode(game));

const isTextList = (value: unknown): value is string[] => Array.isArray(value) && value.every(t => typeof t === "string");
const isEncodedPosition = (value: unknown): value is EncodedPosition => {
    const position = value as Partial<EncodedPosition> | null;
    return typeof position === "object" && position !== null
        && typeof position.table === "string" && isTextList(position.history);
};
const isEncodedGame = (data: Record<string, unknown>): data is EncodedGame => data.format === 3
    && typeof data.table === "string"
    && isTextList(data.history)
    && Array.isArray(data.positions) && data.positions.every(isEncodedPosition);

// null when the text is not a saved game; a game saved in an earlier format is still read
export const decodeSavedGame = (text: string): SavedSpiderGame | null => {
    try {
        const parsed: unknown = JSON.parse(text);
        if (!isStoredObject(parsed)) return null;
        const encoded = migrate(parsed, Number(parsed.format ?? 1), MIGRATIONS);
        if (encoded === null || !isEncodedGame(encoded)) return null;
        const game: unknown = {
            table: decodeTable(encoded.table),
            history: encoded.history.map(decodeTable),
            moveCount: encoded.moveCount,
            positions: encoded.positions.map(position => ({
                table: decodeTable(position.table),
                history: position.history.map(decodeTable),
                moveCount: position.moveCount,
                savedAt: position.savedAt,
            })),
        };
        return isSavedSpiderGame(game) ? game : null;
    } catch {
        return null;
    }
};
