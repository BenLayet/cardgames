import {type PointerEvent, useState} from "react";

import {isDragged, type PointerTarget, type Press, type PressOutcome, pressEnded, pressMoved, pressStarted} from "./card-pointer.ts";

// the column and card under a point of the page, read from the data attributes of the elements
const targetAt = (element: Element | null): PointerTarget | null => {
    const columnElement = element?.closest<HTMLElement>("[data-column]");
    if (!columnElement) return null;
    const cardElement = element?.closest<HTMLElement>("[data-index]");
    return {
        column: Number(columnElement.dataset.column),
        index: cardElement ? Number(cardElement.dataset.index) : null,
    };
};

const pointOf = (event: PointerEvent) => ({pointerId: event.pointerId, x: event.clientX, y: event.clientY});

// Turns the presses on the columns into clicks and drops: the handlers go on the element that holds the columns,
// whose columns carry data-column and whose cards carry data-index. A drag only moves the cards on screen until
// they are dropped, so it stays here, out of the game state.
export const useCardPointer = (movableRunStarts: number[], onOutcome: (outcome: PressOutcome) => void) => {
    const [press, setPress] = useState<Press | null>(null);
    const handlers = {
        onPointerDown: (event: PointerEvent<HTMLElement>) => {
            if (!event.isPrimary || press !== null) return;
            const target = targetAt(event.target as Element);
            if (target === null) return;
            const started = pressStarted(target, pointOf(event), movableRunStarts);
            if (started.canDrag) event.currentTarget.setPointerCapture(event.pointerId);
            setPress(started);
        },
        onPointerMove: (event: PointerEvent<HTMLElement>) => {
            if (press === null) return;
            const moved = pressMoved(press, pointOf(event));
            if (moved !== press) setPress(moved);
        },
        onPointerUp: (event: PointerEvent<HTMLElement>) => {
            if (press?.pointerId !== event.pointerId) return;
            setPress(null);
            // the dragged cards let the pointer through, so the element found is the one below them
            onOutcome(pressEnded(press, press.isDragging ? targetAt(document.elementFromPoint(event.clientX, event.clientY)) : null));
        },
        onPointerCancel: () => {
            setPress(null);
        },
    };
    return {
        handlers,
        isDragged: (column: number, index: number) => isDragged(press, column, index),
        // how far the dragged cards have moved
        dragOffset: {dx: press?.dx ?? 0, dy: press?.dy ?? 0},
    };
};
