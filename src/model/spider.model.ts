import {type Card, type Rank, type Suit, SUITS} from "./deck.model.ts";

// Spider solitaire: two decks dealt into ten columns, one deck into eight columns, or a deck of 32 cards into six columns.
// A completed sequence is a run from the king down to the ace of the same suit; the game is won when every card is in one.
// With 32 cards there is no 2 to 6: the ace goes on the 7.
// The functions below never change the given table, they return a new one.

export const SUIT_COUNT_OPTIONS = [1, 2, 4];
// the first one is the usual game
export const CARD_COUNT_OPTIONS = [104, 52, 32];
// in Spider the ace is the lowest card
const SPIDER_RANKS: readonly Rank[] = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K"];
const SHORT_RANKS: readonly Rank[] = ["A", "7", "8", "9", "T", "J", "Q", "K"];

export type SpiderLayout = {
    columnCount: number;
    // cards dealt into the columns at the start, the others stay in the stock and are dealt one per column
    initialTableauSize: number;
    // the ranks of a sequence, from the lowest
    ranks: readonly Rank[];
};
const LAYOUTS: Readonly<Record<number, SpiderLayout>> = {
    104: {columnCount: 10, initialTableauSize: 54, ranks: SPIDER_RANKS},
    52: {columnCount: 8, initialTableauSize: 28, ranks: SPIDER_RANKS},
    32: {columnCount: 6, initialTableauSize: 20, ranks: SHORT_RANKS},
};
export const spiderLayout = (cardCount: number): SpiderLayout => {
    if (!CARD_COUNT_OPTIONS.includes(cardCount)) throw new Error(`Spider is played with ${CARD_COUNT_OPTIONS.join(" or ")} cards, not ${cardCount}`);
    return LAYOUTS[cardCount];
};

export type SpiderCard = {
    // two decks hold the same cards twice, the id tells them apart
    id: number;
    card: Card;
    faceUp: boolean;
};
export type Table = {
    // the last card of a column is the one on top
    columns: SpiderCard[][];
    // the last card of the stock is dealt first
    stock: SpiderCard[];
    // the suit of each completed sequence
    completed: Suit[];
    // the size of the deck, which tells the ranks of a sequence
    cardCount: number;
};
// The choices made on the setup screen; each combination has its own saved game
export type SpiderVariant = { suitCount: number; cardCount: number };
export const sameVariant = (a: SpiderVariant, b: SpiderVariant) => a.suitCount === b.suitCount && a.cardCount === b.cardCount;
// the number of suits and of cards of a game
export const variantOf = (table: Table): SpiderVariant => ({
    suitCount: new Set([...table.columns.flat(), ...table.stock].map(c => suitOf(c.card)).concat(table.completed)).size,
    cardCount: table.cardCount,
});
export type CardPosition = { column: number; index: number };

export const EMPTY_TABLE: Table = {columns: [], stock: [], completed: [], cardCount: 104};

export const ranksOf = (table: Table): readonly Rank[] => spiderLayout(table.cardCount).ranks;
export const sequenceCountOf = (table: Table): number => table.cardCount / ranksOf(table).length;

// the position of the rank of a card in a sequence, from 0 for the ace
const rankIn = (ranks: readonly Rank[], card: Card) => ranks.indexOf(card.charAt(0) as Rank);
export const suitOf = (card: Card) => card.charAt(1) as Suit;

// The cards with fewer suits repeated more often: with 104 cards, 8 times spades, 4 times spades and hearts, or twice each suit
export const createSpiderDeck = (suitCount: number, cardCount: number): Card[] => {
    if (!SUIT_COUNT_OPTIONS.includes(suitCount)) throw new Error(`Spider is played with 1, 2 or 4 suits, not ${suitCount}`);
    const {ranks} = spiderLayout(cardCount);
    const suits = SUITS.slice(0, suitCount);
    const copies = cardCount / (suits.length * ranks.length);
    return Array.from({length: copies}).flatMap(() =>
        suits.flatMap(suit => ranks.map((rank): Card => `${rank}${suit}`)));
};

const revealTop = (column: SpiderCard[]): SpiderCard[] => {
    const top = column[column.length - 1] as SpiderCard | undefined;
    return top === undefined || top.faceUp ? column : [...column.slice(0, -1), {...top, faceUp: true}];
};

// Deals the cards one by one around the columns: with 104 cards, the first four columns get six cards, the others five
export const dealTable = (deck: Card[]): Table => {
    const {columnCount, initialTableauSize} = spiderLayout(deck.length);
    const cards = deck.map((card, id): SpiderCard => ({id, card, faceUp: false}));
    const columns = Array.from({length: columnCount}, (_, column) =>
        revealTop(cards.slice(0, initialTableauSize).filter((_, i) => i % columnCount === column)));
    return {columns, stock: cards.slice(initialTableauSize), completed: [], cardCount: deck.length};
};

export const followsInSequence = (upper: SpiderCard, lower: SpiderCard, ranks: readonly Rank[]) =>
    upper.faceUp && lower.faceUp
    && suitOf(upper.card) === suitOf(lower.card)
    && rankIn(ranks, upper.card) === rankIn(ranks, lower.card) + 1;

// Index of the first card of the run that can be moved from the bottom of a column:
// face up cards of the same suit in descending order. The length of the column when it is empty.
export const movableRunStart = (column: SpiderCard[], ranks: readonly Rank[]): number => {
    if (column.length === 0) return 0;
    let start = column.length - 1;
    while (start > 0 && followsInSequence(column[start - 1], column[start], ranks)) start--;
    return start;
};

export const canPickCards = (table: Table, {column, index}: CardPosition): boolean => {
    const cards = table.columns[column] as SpiderCard[] | undefined;
    return cards !== undefined && index < cards.length && index >= movableRunStart(cards, ranksOf(table));
};

// A run goes on an empty column, or on a card one rank higher whatever its suit
export const canMoveCards = (table: Table, from: CardPosition, to: number): boolean => {
    const target = table.columns[to] as SpiderCard[] | undefined;
    if (target === undefined || from.column === to || !canPickCards(table, from)) return false;
    const targetTop = target[target.length - 1] as SpiderCard | undefined;
    if (targetTop === undefined) return true;
    const ranks = ranksOf(table);
    return rankIn(ranks, targetTop.card) === rankIn(ranks, table.columns[from.column][from.index].card) + 1;
};

// The card left on top of the source column is turned face up
export const moveCards = (table: Table, from: CardPosition, to: number): Table => {
    if (!canMoveCards(table, from, to)) throw new Error("These cards cannot be moved there");
    const moved = table.columns[from.column].slice(from.index);
    return {
        ...table,
        columns: table.columns.map((column, i) => {
            if (i === from.column) return revealTop(column.slice(0, from.index));
            if (i === to) return [...column, ...moved];
            return column;
        }),
    };
};

// A row can only be dealt when no column is empty
export const canDealRow = (table: Table): boolean =>
    table.stock.length > 0 && table.columns.every(column => column.length > 0);

export const stockRowCount = (table: Table): number => Math.ceil(table.stock.length / table.columns.length);

// One face up card on each column
export const dealRow = (table: Table): Table => {
    if (!canDealRow(table)) throw new Error("A row cannot be dealt now");
    const row = table.stock.slice(-table.columns.length).reverse();
    return {
        ...table,
        stock: table.stock.slice(0, -row.length),
        columns: table.columns.map((column, i) => i < row.length ? [...column, {...row[i], faceUp: true}] : column),
    };
};

const endsWithCompletedSequence = (column: SpiderCard[], ranks: readonly Rank[]) =>
    column.length >= ranks.length && movableRunStart(column, ranks) <= column.length - ranks.length;

export const hasCompletedSequence = (table: Table): boolean =>
    table.columns.some(column => endsWithCompletedSequence(column, ranksOf(table)));

// Removes every completed sequence from the bottom of the columns and turns the card left on top face up
export const collectCompletedSequences = (table: Table): Table => {
    const completed = [...table.completed];
    const ranks = ranksOf(table);
    const columns = table.columns.map(column => {
        if (!endsWithCompletedSequence(column, ranks)) return column;
        completed.push(suitOf(column[column.length - 1].card));
        return revealTop(column.slice(0, -ranks.length));
    });
    return {...table, columns, completed};
};

export const isWon = (table: Table): boolean =>
    table.completed.length > 0 && table.stock.length === 0 && table.columns.every(column => column.length === 0);

// The columns where the cards from this position can go
export const destinationsOf = (table: Table, from: CardPosition): number[] =>
    table.columns.flatMap((_, to) => canMoveCards(table, from, to) ? [to] : []);

// The columns offered when the cards are clicked: the cards that can take them, else the leftmost empty column.
// Dropping the cards on any empty column remains possible.
export const clickDestinationsOf = (table: Table, from: CardPosition): number[] => {
    const destinations = destinationsOf(table, from);
    const onCards = destinations.filter(to => table.columns[to].length > 0);
    return onCards.length > 0 ? onCards : destinations.slice(0, 1);
};

export type Move = { from: CardPosition, to: number };
export type Hint = { kind: "move", move: Move } | { kind: "emptyColumn" } | { kind: "deal" } | { kind: "none" };

// How useful a move is, or null when it changes nothing worth doing
const moveScore = (table: Table, {from, to}: Move): number | null => {
    const column = table.columns[from.column];
    const moved = column[from.index];
    const below = from.index > 0 ? column[from.index - 1] : undefined;
    const target = table.columns[to] as SpiderCard[] | undefined;
    const targetTop = target?.[target.length - 1];
    // a whole column moved to an empty one stays the same
    if (below === undefined && targetTop === undefined) return null;
    const buildsSuit = targetTop !== undefined && suitOf(targetTop.card) === suitOf(moved.card);
    // the cards already lie on a card one rank higher: moving them only helps to join their own suit
    const ranks = ranksOf(table);
    if (below?.faceUp === true && rankIn(ranks, below.card) === rankIn(ranks, moved.card) + 1) {
        return buildsSuit && suitOf(below.card) !== suitOf(moved.card) ? 1 : null;
    }
    let score = 0;
    if (buildsSuit) score += 2;
    if (below !== undefined && !below.faceUp) score += 3;
    if (below === undefined) score += 1;
    // an empty column is precious: better use a card when there is one
    if (targetTop === undefined) score -= 2;
    return score;
};

// The useful moves, the most useful first: building a suit, turning a card over, emptying a column
export const findMoves = (table: Table): Move[] =>
    table.columns
        .flatMap((column, columnIndex) => {
            if (column.length === 0) return [];
            const from = {column: columnIndex, index: movableRunStart(column, ranksOf(table))};
            return destinationsOf(table, from).map(to => ({from, to}));
        })
        .map(move => ({move, score: moveScore(table, move)}))
        .filter((scored): scored is { move: Move, score: number } => scored.score !== null)
        .sort((a, b) => b.score - a.score)
        .map(scored => scored.move);

// The hints shown one after the other: the useful moves onto a card,
// then, said in words only, that an empty column can be used,
// else dealing a row, else nothing left to do
export const findHints = (table: Table): Hint[] => {
    const moves = findMoves(table);
    const ontoCards = moves
        .filter(move => table.columns[move.to].length > 0)
        .map((move): Hint => ({kind: "move", move}));
    const emptyColumn: Hint[] = moves.some(move => table.columns[move.to].length === 0) ? [{kind: "emptyColumn"}] : [];
    const hints = [...ontoCards, ...emptyColumn];
    if (hints.length > 0) return hints;
    return [canDealRow(table) ? {kind: "deal"} : {kind: "none"}];
};

// A game in progress, as it is saved to be resumed later
export type SavedSpiderGame = {
    table: Table;
    // the tables before the last moves, for the undo
    history: Table[];
    moveCount: number;
};

const isSpiderCard = (value: unknown): value is SpiderCard => {
    const card = value as Partial<SpiderCard> | null;
    return typeof card === "object" && card !== null
        && typeof card.id === "number"
        && typeof card.faceUp === "boolean"
        && typeof card.card === "string" && rankIn(SPIDER_RANKS, card.card) >= 0 && SUITS.includes(suitOf(card.card));
};
const isCardList = (value: unknown): value is SpiderCard[] => Array.isArray(value) && value.every(isSpiderCard);
const isTable = (value: unknown): value is Table => {
    const table = value as Partial<Table> | null;
    if (typeof table !== "object" || table === null
        || !Array.isArray(table.columns) || !table.columns.every(isCardList)
        || !isCardList(table.stock)
        || !Array.isArray(table.completed) || !table.completed.every(suit => SUITS.includes(suit))
        || typeof table.cardCount !== "number" || !CARD_COUNT_OPTIONS.includes(table.cardCount)) return false;
    const {columnCount, ranks} = spiderLayout(table.cardCount);
    const cards = [...table.columns.flat(), ...table.stock];
    return table.columns.length === columnCount
        && cards.every(card => rankIn(ranks, card.card) >= 0)
        && cards.length + table.completed.length * ranks.length === table.cardCount;
};

// Tables were saved without their number of cards when there were always 104 of them, then 104 or 52
export const withLegacyCardCount = (value: unknown): unknown => {
    const table = value as Partial<Table> | null;
    if (typeof table !== "object" || table === null || table.cardCount !== undefined
        || !Array.isArray(table.columns) || !Array.isArray(table.stock) || !Array.isArray(table.completed)) return value;
    const cardCount = (table.columns as unknown[][]).reduce((count, column) => count + (Array.isArray(column) ? column.length : 0), 0)
        + table.stock.length + table.completed.length * SPIDER_RANKS.length;
    return {...table, cardCount};
};

// Data read back from the storage may have been written by another version of the game, or changed by hand
export const isSavedSpiderGame = (value: unknown): value is SavedSpiderGame => {
    const game = value as Partial<SavedSpiderGame> | null;
    return typeof game === "object" && game !== null
        && isTable(game.table)
        && Array.isArray(game.history) && game.history.every(isTable)
        && typeof game.moveCount === "number";
};
