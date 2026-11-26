import {CardView} from "./CardView.tsx";
import {useLayoutEffect, useRef} from "react";
import type {Card, CardPlacement, StackLocation} from "../../model/deck.model.ts";

interface CardProps {
    card: Card;
    placement: CardPlacement;
    layoutState: LayoutState;
    // how the card comes on the table: dealt after a delay in milliseconds, or already in place (a resumed game)
    entry?: number | "inPlace";
}

type Coordinates = { top: number, left: number };
export type LayoutState = {
    table?: Coordinates;
    stackLocations: Partial<Record<StackLocation, Coordinates>>
    // how far a fanned card of a stack moves aside for each step, in pixels; by default to the right and down
    fanSteps?: Partial<Record<StackLocation, { x: number, y: number }>>
};

function fakeRandom(seed: number) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

function translateRangeKeeping0(value: number) {
    return (value + 1.5) % 1 - 0.5;
}

export const MAX_STACK_DEPTH = 8;

// a fanned card moves aside by part of its size for each step, to the right and down
const FAN_X = 0.07;
const FAN_Y = 0.08;

function computeFinalPosition(location: Pick<CardPlacement, "stackLocation" | "index" | "messyLevel" | "fan">, layoutState: LayoutState, size: { width: number, height: number }) {
    const stackCoordinates = {
        top: (layoutState.stackLocations[location.stackLocation]?.top ?? 0) - (layoutState.table?.top ?? 0),
        left: (layoutState.stackLocations[location.stackLocation]?.left ?? 0) - (layoutState.table?.left ?? 0)
    }
    // stack and table coordinates come from the same viewport, so scrolling does not change their difference
    // a stack grows up and to the right by one pixel per card, up to a few pixels, so that it stays on its slot
    const depth = Math.min(location.index, MAX_STACK_DEPTH);
    const fan = location.fan ?? 0;
    const fanStep = layoutState.fanSteps?.[location.stackLocation] ?? {x: FAN_X * size.width, y: FAN_Y * size.height};
    const x = stackCoordinates.left + depth / 2 + fan * fanStep.x;
    const y = stackCoordinates.top - depth + fan * fanStep.y;

    return {
        x,
        y,
        rotation: translateRangeKeeping0(fakeRandom(location.index)) * location.messyLevel,
    };
}

const MOVE_MS = 500;
// slows down towards the end, like a card sliding on the felt
const EASE_OUT = "cubic-bezier(0.33, 1, 0.68, 1)";

export function AnimatedCardView({card, placement, layoutState, entry = 0}: CardProps) {
    const ref = useRef<HTMLDivElement>(null);
    const movement = useRef<Animation | null>(null);
    // only the first movement of the card is its entry on the table
    const entryRef = useRef<number | "inPlace" | null>(entry);
    const {stackLocation, index, messyLevel, fan} = placement;
    // The card moves from where it is on screen, even in the middle of a previous movement, to where it belongs
    useLayoutEffect(() => {
        const element = ref.current;
        if (!element) return;
        const {x, y, rotation} = computeFinalPosition({stackLocation, index, messyLevel, fan}, layoutState, {width: element.offsetWidth, height: element.offsetHeight});
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
    }, [stackLocation, index, messyLevel, fan, layoutState]);

    return (
        <div ref={ref} style={{position: "absolute", zIndex: placement.index + placement.stackIndex * 100}}>
            <CardView card={card} faceUp={placement.faceUp}/>
        </div>
    );
}
