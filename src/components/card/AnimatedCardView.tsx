import {CardView} from "./CardView.tsx";
import {CompactCardView} from "./CompactCardView.tsx";
import {cardTilt} from "./card-tilt.ts";
import {useEffect, useLayoutEffect, useRef, useState} from "react";
import type {Card, CardPlacement, StackLocation} from "../../model/deck.model.ts";
import {LANDED_AT, LANDED_MS, LANDING_MS, RAISE} from "./card-motion.ts";

interface CardProps {
    card: Card;
    placement: CardPlacement;
    layoutState: LayoutState;
    // how the card comes on the table: dealt after a delay in milliseconds, or already in place (a resumed game)
    entry?: number | "inPlace";
    // a small card is drawn compact, so that its value and suit can be read
    compact?: boolean;
    // where the card lands when it comes from another stack, from the top left corner of the table like the stacks:
    // it flies there in an arc over everything, face up, then slides to its place under the cards of its stack,
    // turning over (a card won in Bataille, going under the pile of the winner)
    landing?: Coordinates;
    // the card rises from its stack, grows a little and shines (the card that won a round)
    raised?: boolean;
    // the card is greyed, card by card so that the grey covers it exactly, tilted or not (a player out of a battle)
    dimmed?: boolean;
}

export type Coordinates = { top: number, left: number };
export type LayoutState = {
    table?: Coordinates;
    stackLocations: Partial<Record<StackLocation, Coordinates>>
};

export const MAX_STACK_DEPTH = 8;

function computeFinalPosition(card: Card, location: Pick<CardPlacement, "stackLocation" | "index" | "messyLevel">, layoutState: LayoutState) {
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
        rotation: cardTilt(card, location.stackLocation, location.messyLevel),
    };
}

const MOVE_MS = 500;
// slows down towards the end, like a card sliding on the felt
const EASE_OUT = "cubic-bezier(0.33, 1, 0.68, 1)";
// a raised card goes a little past its place, and comes back
const EASE_BOUNCE = "cubic-bezier(0.2, 1.5, 0.4, 1)";

// the top of the arc: part of the flight, how high above the straight line in part of the card height, and how much the card grows
const ARC = {at: 0.35, height: 0.6, scale: 1.18};

const transformOf = ({x, y, rotation}: { x: number, y: number, rotation: number }, scale = 1) =>
    `translate(${x}px, ${y}px) rotate(${rotation}deg)${scale === 1 ? "" : ` scale(${scale})`}`;

// where a transform puts the top left corner of the card, null when it cannot be read
const translationOf = (transform: string) => {
    if (typeof DOMMatrixReadOnly !== "function" || transform === "none") return null;
    const matrix = new DOMMatrixReadOnly(transform);
    return {x: matrix.e, y: matrix.f};
};

export function AnimatedCardView({card, placement, layoutState, entry = 0, compact = false, landing, raised = false, dimmed = false}: CardProps) {
    const ref = useRef<HTMLDivElement>(null);
    const movement = useRef<Animation | null>(null);
    // only the first movement of the card is its entry on the table
    const entryRef = useRef<number | "inPlace" | null>(entry);
    // the stack the card was in, to know when it comes from another one
    const stackRef = useRef(placement.stackLocation);
    // the end of a landing under way: the card keeps flying over everything if its place changes again before
    const landingEndRef = useRef(0);
    const {stackLocation, index, stackIndex, messyLevel} = placement;
    const zIndex = index + stackIndex * 100;
    const landingLeft = landing?.left;
    const landingTop = landing?.top;
    // a card that lands shows its face until it has landed, then turns over as it goes under its stack
    const [shownStack, setShownStack] = useState(stackLocation);
    const [isHeldFaceUp, setHeldFaceUp] = useState(false);
    if (shownStack !== stackLocation) {
        setShownStack(stackLocation);
        setHeldFaceUp(landing !== undefined);
    }
    useEffect(() => {
        if (!isHeldFaceUp) return;
        const timer = setTimeout(() => setHeldFaceUp(false), LANDED_MS);
        return () => clearTimeout(timer);
    }, [isHeldFaceUp]);
    const faceUp = placement.faceUp || isHeldFaceUp;
    // The card moves from where it is on screen, even in the middle of a previous movement, to where it belongs
    useLayoutEffect(() => {
        const element = ref.current;
        if (!element) return;
        const comesFromAnotherStack = stackRef.current !== stackLocation;
        stackRef.current = stackLocation;
        const position = computeFinalPosition(card, {stackLocation, index, messyLevel}, layoutState);
        const target = raised
            ? transformOf({x: position.x, y: position.y - element.offsetHeight * RAISE.height, rotation: 0}, RAISE.scale)
            : transformOf(position);
        const delay = entryRef.current ?? 0;
        entryRef.current = null;
        const canMove = delay !== "inPlace" && typeof element.animate === "function";
        const now = performance.now();
        const lands = canMove && landingLeft !== undefined && landingTop !== undefined && (comesFromAnotherStack || now < landingEndRef.current);
        // read before the previous movement is stopped, so that it includes where that movement has taken the card
        const current = getComputedStyle(element).transform;
        movement.current?.cancel();
        element.style.transform = target;
        if (!canMove) return;
        if (lands) {
            movement.current = element.animate(landingKeyframes(element, current, target, position, {
                x: landingLeft - (layoutState.table?.left ?? 0),
                y: landingTop - (layoutState.table?.top ?? 0),
            }, zIndex), {duration: LANDING_MS, easing: "linear"});
            landingEndRef.current = now + LANDING_MS;
            return;
        }
        // a dealt card waits on the deck for its turn
        movement.current = element.animate([{transform: current}, {transform: target}],
            {duration: MOVE_MS, delay, easing: raised ? EASE_BOUNCE : EASE_OUT, fill: "backwards"});
    }, [card, stackLocation, index, messyLevel, layoutState, raised, landingLeft, landingTop, zIndex]);

    return (
        <div ref={ref} className={["animated-card", raised && "animated-card--raised", dimmed && "animated-card--dimmed"].filter(Boolean).join(" ")} style={{position: "absolute", zIndex}}>
            {compact ? <CompactCardView card={card} faceUp={faceUp}/> : <CardView card={card} faceUp={faceUp}/>}
        </div>
    );
}

// The flight of a card won: over everything (--z-cards-landing) in an arc to where it lands, face up,
// then under the cards of its stack (its own z-index) to its place
function landingKeyframes(element: HTMLElement, current: string, target: string, position: { rotation: number }, landing: { x: number, y: number }, zIndex: number): Keyframe[] {
    const over = getComputedStyle(element).getPropertyValue("--z-cards-landing").trim() || "auto";
    const landed = transformOf({...landing, rotation: position.rotation});
    const start = translationOf(current);
    const arc = start === null ? [] : [{
        offset: ARC.at,
        transform: transformOf({
            x: start.x + (landing.x - start.x) * ARC.at / LANDED_AT,
            y: start.y + (landing.y - start.y) * ARC.at / LANDED_AT - element.offsetHeight * ARC.height,
            rotation: position.rotation * 2,
        }, ARC.scale),
        zIndex: over,
        easing: "ease-in",
    }];
    return [
        {offset: 0, transform: current, zIndex: over, easing: "ease-out"},
        ...arc,
        {offset: LANDED_AT, transform: landed, zIndex: over},
        {offset: LANDED_AT + 0.01, transform: landed, zIndex: String(zIndex), easing: "ease-in"},
        {offset: 1, transform: target, zIndex: String(zIndex)},
    ];
}
