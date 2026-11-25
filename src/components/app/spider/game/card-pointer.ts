import type {CardPosition, Move} from "../../../../model/spider.model.ts";

// a press that moves less than this is a click, not a drag
export const DRAG_THRESHOLD_PX = 8;

// what lies under the pointer: a column, and the card in it, or null for an empty part of the column
export type PointerTarget = { column: number, index: number | null };

export type Press = {
    pointerId: number;
    // the card under the pointer, none for an empty part of a column
    position: CardPosition | null;
    column: number;
    canDrag: boolean;
    startX: number;
    startY: number;
    dx: number;
    dy: number;
    isDragging: boolean;
};

// what the press means for the game once the pointer is released
export type PressOutcome =
    | { kind: "cardClicked", position: CardPosition }
    | { kind: "columnClicked", column: number }
    | { kind: "cardsDropped", move: Move }
    | { kind: "none" };

type Point = { pointerId: number, x: number, y: number };

// A press starts on a column; only the cards from the first movable one of their column can be dragged
export const pressStarted = (target: PointerTarget, {pointerId, x, y}: Point, movableRunStarts: number[]): Press => {
    const position = target.index === null ? null : {column: target.column, index: target.index};
    return {
        pointerId, position, column: target.column,
        canDrag: position !== null && position.index >= movableRunStarts[position.column],
        startX: x, startY: y, dx: 0, dy: 0, isDragging: false,
    };
};

// The dragged cards follow the pointer; once a drag has started, it stays a drag
export const pressMoved = (press: Press, {pointerId, x, y}: Point): Press => {
    if (press.pointerId !== pointerId || !press.canDrag) return press;
    const dx = x - press.startX;
    const dy = y - press.startY;
    return {...press, dx, dy, isDragging: press.isDragging || Math.hypot(dx, dy) > DRAG_THRESHOLD_PX};
};

// A drag ends on the column under the pointer, a press without a drag is a click
export const pressEnded = (press: Press, dropTarget: PointerTarget | null): PressOutcome => {
    if (press.isDragging && press.position !== null) {
        return dropTarget !== null && dropTarget.column !== press.position.column
            ? {kind: "cardsDropped", move: {from: press.position, to: dropTarget.column}}
            : {kind: "none"};
    }
    if (press.position !== null) return {kind: "cardClicked", position: press.position};
    return {kind: "columnClicked", column: press.column};
};

// whether the card at this place moves with the pointer
export const isDragged = (press: Press | null, column: number, index: number): boolean =>
    press?.isDragging === true && press.position?.column === column && index >= press.position.index;
