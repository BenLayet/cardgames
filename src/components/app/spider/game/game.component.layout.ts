import {followsInSequence, type SpiderCard} from "../../../../model/spider.model.ts";

// How much of a covered card is visible, in card heights.
// A compact card shows its value and suit on its top line, so less of it is needed.
const FACE_DOWN = 0.12;
const FACE_UP = {regular: 0.28, compact: 0.32};
// the least visible part of a card once a column is squeezed
const MIN_FACE_DOWN = 0.04;
const MIN_INSIDE_SEQUENCE = 0.07;

// a card between two cards of its sequence: its value can be told from the cards around it
const isInsideSequence = (column: SpiderCard[], index: number) =>
    index > 0 && index < column.length - 1
    && followsInSequence(column[index - 1], column[index])
    && followsInSequence(column[index], column[index + 1]);

// Shrinks the given gaps, at most down to their minimum, by the given total amount; returns what could not be taken
const shrink = (gaps: number[], minimums: number[], indexes: number[], excess: number): number => {
    const room = indexes.reduce((sum, i) => sum + gaps[i] - minimums[i], 0);
    if (room <= 0) return excess;
    const ratio = Math.min(1, excess / room);
    indexes.forEach(i => {
        gaps[i] -= (gaps[i] - minimums[i]) * ratio;
    });
    return excess - room * ratio;
};

// Top of each card, in card heights. When the column is taller than the given room (in card heights,
// below the top of the first card), the face down cards are squeezed first, then the cards inside a sequence,
// then every card alike.
export const cardOffsets = (column: SpiderCard[], room: number, compact: boolean): number[] => {
    if (column.length === 0) return [];
    // the gap after each card but the last one
    const gaps = column.slice(0, -1).map(card => card.faceUp ? FACE_UP[compact ? "compact" : "regular"] : FACE_DOWN);
    const minimums = gaps.map((gap, i) => {
        if (!column[i].faceUp) return MIN_FACE_DOWN;
        return isInsideSequence(column, i) ? MIN_INSIDE_SEQUENCE : gap;
    });
    const all = gaps.map((_, i) => i);
    let excess = gaps.reduce((sum, gap) => sum + gap, 0) - room;
    if (excess > 0) excess = shrink(gaps, minimums, all.filter(i => !column[i].faceUp), excess);
    if (excess > 0) excess = shrink(gaps, minimums, all.filter(i => column[i].faceUp), excess);
    if (excess > 0) {
        const total = gaps.reduce((sum, gap) => sum + gap, 0);
        const ratio = room / total;
        gaps.forEach((_, i) => gaps[i] *= ratio);
    }
    return column.map((_, i) => gaps.slice(0, i).reduce((sum, gap) => sum + gap, 0));
};
