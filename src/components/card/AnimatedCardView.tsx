import {CardView} from "./CardView.tsx";
import {CompactCardView} from "./CompactCardView.tsx";
import {useLayoutEffect, useRef} from "react";
import type {Card, CardPlacement, StackLocation} from "../../model/deck.model.ts";

interface CardProps {
    card: Card;
    placement: CardPlacement;
    layoutState: LayoutState;
    // how the card comes on the table: dealt after a delay in milliseconds, or already in place (a resumed game)
    entry?: number | "inPlace";
    // a small card is drawn compact, so that its value and suit can be read
    compact?: boolean;
}

type Coordinates = { top: number, left: number };
export type LayoutState = {
    table?: Coordinates;
    stackLocations: Partial<Record<StackLocation, Coordinates>>
};

function fakeRandom(seed: number) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

function translateRangeKeeping0(value: number) {
    return (value + 1.5) % 1 - 0.5;
}

export const MAX_STACK_DEPTH = 8;

function computeFinalPosition(location: Pick<CardPlacement, "stackLocation" | "index" | "messyLevel">, layoutState: LayoutState) {
    const stackCoordinates = {
        top: (layoutState.stackLocations[location.stackLocation]?.top ?? 0) - (layoutState.table?.top ?? 0),
        left: (layoutState.stackLocations[location.stackLocation]?.left ?? 0) - (layoutState.table?.left ?? 0)
    }
    // stack and table coordinates come from the same viewport, so scrolling does not change their difference
    // a stack grows up and to the right by one pixel per card, up to a few pixels, so that it stays on its slot
    const depth = Math.min(location.index, MAX_STACK_DEPTH);
    const x = stackCoordinates.left + depth / 2;
    const y = stackCoordinates.top - depth;

    return {
        x,
        y,
        rotation: translateRangeKeeping0(fakeRandom(location.index)) * location.messyLevel,
    };
}

const MOVE_MS = 500;
// slows down towards the end, like a card sliding on the felt
const EASE_OUT = "cubic-bezier(0.33, 1, 0.68, 1)";

export function AnimatedCardView({card, placement, layoutState, entry = 0, compact = false}: CardProps) {
    const ref = useRef<HTMLDivElement>(null);
    const movement = useRef<Animation | null>(null);
    // only the first movement of the card is its entry on the table
    const entryRef = useRef<number | "inPlace" | null>(entry);
    const {stackLocation, index, messyLevel} = placement;
    // The card moves from where it is on screen, even in the middle of a previous movement, to where it belongs
    useLayoutEffect(() => {
        const element = ref.current;
        if (!element) return;
        const {x, y, rotation} = computeFinalPosition({stackLocation, index, messyLevel}, layoutState);
        const target = `translate(${x}px, ${y}px) rotate(${rotation}deg)`;
        // read before the previous movement is stopped, so that it includes where that movement has taken the card
        const current = getComputedStyle(element).transform;
        movement.current?.cancel();
        element.style.transform = target;
        const delay = entryRef.current ?? 0;
        entryRef.current = null;
        if (delay === "inPlace" || typeof element.animate !== "function") return;
        // a dealt card waits on the deck for its turn
        movement.current = element.animate([{transform: current}, {transform: target}], {duration: MOVE_MS, delay, easing: EASE_OUT, fill: "backwards"});
    }, [stackLocation, index, messyLevel, layoutState]);

    return (
        <div ref={ref} style={{position: "absolute", zIndex: placement.index + placement.stackIndex * 100}}>
            {compact ? <CompactCardView card={card} faceUp={placement.faceUp}/> : <CardView card={card} faceUp={placement.faceUp}/>}
        </div>
    );
}
