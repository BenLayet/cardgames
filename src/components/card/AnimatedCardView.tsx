import {CardView} from "./CardView.tsx";
import {useLayoutEffect, useRef} from "react";
import gsap from "gsap";
import type {Card, CardPlacement, StackLocation} from "../../model/deck.model.ts";

interface CardProps {
    card: Card;
    placement: CardPlacement;
    layoutState: LayoutState;
}

type Coordinates = { top: number, left: number };
export type LayoutState = {
    table?: Coordinates;
    stackLocations: Record<StackLocation, Coordinates | undefined>
};

function fakeRandom(seed: number) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

function translateRangeKeeping0(value: number) {
    return (value + 1.5) % 1 - 0.5;
}

function computeFinalPosition(location: CardPlacement, layoutState: LayoutState) {
    const stackCoordinates = {
        top: (layoutState.stackLocations[location.stackLocation]?.top ?? 0) - (layoutState.table?.top ?? 0),
        left: (layoutState.stackLocations[location.stackLocation]?.left ?? 0) - (layoutState.table?.left ?? 0)
    }
    // stack and table coordinates come from the same viewport, so scrolling does not change their difference
    const x = stackCoordinates.left + location.index / 2;
    const y = stackCoordinates.top - location.index;

    return {
        x,
        y,
        rotation: translateRangeKeeping0(fakeRandom(location.index)) * location.messyLevel,
    };
}

export function AnimatedCardView({card, placement, layoutState}: CardProps) {
    const ref = useRef<HTMLDivElement>(null);
    useLayoutEffect(() => {
        if (!ref.current) return;
        const {x, y, rotation} = computeFinalPosition(placement, layoutState);
        gsap.to(ref.current, {x, y, rotation, duration: 0.5, ease: "power2.out"});
    }, [placement.stackLocation, placement.index, layoutState]);

    return (
        <div ref={ref} style={{position: "absolute", zIndex: placement.index + placement.stackIndex * 100}}>
            <CardView card={card} faceUp={placement.faceUp}/>
        </div>
    );
}
