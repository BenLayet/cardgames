import {type Card, type Rank, type Suit, SUITS} from "./deck.model.ts";

// Spider solitaire: two decks dealt into ten columns.
// A completed sequence is a run from the king down to the ace of the same suit; eight of them win the game.
// The functions below never change the given table, they return a new one.

export const COLUMN_COUNT = 10;
export const SEQUENCE_COUNT = 8;
export const SUIT_COUNT_OPTIONS = [1, 2, 4];
const DECK_SIZE = 104;
// cards dealt into the columns at the start, the others stay in the stock
const INITIAL_TABLEAU_SIZE = 54;
// in Spider the ace is the lowest card
const SPIDER_RANKS: readonly Rank[] = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K"];

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
};
export type CardPosition = { column: number; index: number };

export const EMPTY_TABLE: Table = {columns: Array.from({length: COLUMN_COUNT}, () => []), stock: [], completed: []};

export const spiderRank = (card: Card) => SPIDER_RANKS.indexOf(card.charAt(0) as Rank);
export const suitOf = (card: Card) => card.charAt(1) as Suit;

// The 104 cards with fewer suits repeated more often: 8 times spades, 4 times spades and hearts, or twice each suit
export const createSpiderDeck = (suitCount: number): Card[] => {
    if (!SUIT_COUNT_OPTIONS.includes(suitCount)) throw new Error(`Spider is played with 1, 2 or 4 suits, not ${suitCount}`);
    const suits = SUITS.slice(0, suitCount);
    const copies = DECK_SIZE / (suits.length * SPIDER_RANKS.length);
    return Array.from({length: copies}).flatMap(() =>
        suits.flatMap(suit => SPIDER_RANKS.map((rank): Card => `${rank}${suit}`)));
};

const revealTop = (column: SpiderCard[]): SpiderCard[] => {
    const top = column[column.length - 1] as SpiderCard | undefined;
    return top === undefined || top.faceUp ? column : [...column.slice(0, -1), {...top, faceUp: true}];
};

// Deals the cards one by one around the columns: the first four columns get six cards, the others five
export const dealTable = (deck: Card[]): Table => {
    if (deck.length !== DECK_SIZE) throw new Error(`Spider needs ${DECK_SIZE} cards, not ${deck.length}`);
    const cards = deck.map((card, id): SpiderCard => ({id, card, faceUp: false}));
    const columns = Array.from({length: COLUMN_COUNT}, (_, column) =>
        revealTop(cards.slice(0, INITIAL_TABLEAU_SIZE).filter((_, i) => i % COLUMN_COUNT === column)));
    return {columns, stock: cards.slice(INITIAL_TABLEAU_SIZE), completed: []};
};

const followsInSequence = (upper: SpiderCard, lower: SpiderCard) =>
    upper.faceUp && lower.faceUp
    && suitOf(upper.card) === suitOf(lower.card)
    && spiderRank(upper.card) === spiderRank(lower.card) + 1;

// Index of the first card of the run that can be moved from the bottom of a column:
// face up cards of the same suit in descending order. The length of the column when it is empty.
export const movableRunStart = (column: SpiderCard[]): number => {
    if (column.length === 0) return 0;
    let start = column.length - 1;
    while (start > 0 && followsInSequence(column[start - 1], column[start])) start--;
    return start;
};

export const canPickCards = (table: Table, {column, index}: CardPosition): boolean => {
    const cards = table.columns[column] as SpiderCard[] | undefined;
    return cards !== undefined && index < cards.length && index >= movableRunStart(cards);
};

// A run goes on an empty column, or on a card one rank higher whatever its suit
export const canMoveCards = (table: Table, from: CardPosition, to: number): boolean => {
    const target = table.columns[to] as SpiderCard[] | undefined;
    if (target === undefined || from.column === to || !canPickCards(table, from)) return false;
    const targetTop = target[target.length - 1] as SpiderCard | undefined;
    if (targetTop === undefined) return true;
    return spiderRank(targetTop.card) === spiderRank(table.columns[from.column][from.index].card) + 1;
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

export const stockRowCount = (table: Table): number => Math.ceil(table.stock.length / COLUMN_COUNT);

// One face up card on each column
export const dealRow = (table: Table): Table => {
    if (!canDealRow(table)) throw new Error("A row cannot be dealt now");
    const row = table.stock.slice(-COLUMN_COUNT).reverse();
    return {
        ...table,
        stock: table.stock.slice(0, -COLUMN_COUNT),
        columns: table.columns.map((column, i) => i < row.length ? [...column, {...row[i], faceUp: true}] : column),
    };
};

const SEQUENCE_LENGTH = SPIDER_RANKS.length;
const endsWithCompletedSequence = (column: SpiderCard[]) =>
    column.length >= SEQUENCE_LENGTH && movableRunStart(column) <= column.length - SEQUENCE_LENGTH;

export const hasCompletedSequence = (table: Table): boolean => table.columns.some(endsWithCompletedSequence);

// Removes every completed sequence from the bottom of the columns and turns the card left on top face up
export const collectCompletedSequences = (table: Table): Table => {
    const completed = [...table.completed];
    const columns = table.columns.map(column => {
        if (!endsWithCompletedSequence(column)) return column;
        completed.push(suitOf(column[column.length - 1].card));
        return revealTop(column.slice(0, -SEQUENCE_LENGTH));
    });
    return {...table, columns, completed};
};

export const isWon = (table: Table): boolean => table.completed.length === SEQUENCE_COUNT;
