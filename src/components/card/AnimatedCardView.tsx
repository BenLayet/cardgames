import {CardView} from "./CardView.tsx";
import {useLayoutEffect, useRef, useState} from "react";
import gsap from "gsap";
import type {Card, CardLocation, StackLocation} from "../../model/deck.model.ts";

interface CardProps {
    card: Card;
    location: CardLocation;
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

function computeFinalPosition(location: CardLocation, layoutState: LayoutState) {
    const stackCoordinates = {
        top: (layoutState.stackLocations[location.stackLocation]?.top ?? 0) - (layoutState.table?.top ?? 0),
        left: (layoutState.stackLocations[location.stackLocation]?.left ?? 0) - (layoutState.table?.left ?? 0)
    }
    // Convert viewport coordinates (from getBoundingClientRect) to document coordinates
    // by adding the scroll offset, then subtract the element's initial position
    const x = stackCoordinates.left + location.index / 2;
    const y = stackCoordinates.top - location.index;

    return {
        x,
        y,
        rotation: translateRangeKeeping0(fakeRandom(location.index)) * location.messyLevel,
    };
}

export function AnimatedCardView({card, location, layoutState}: CardProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [, setScrollPos] = useState(0);

    useLayoutEffect(() => {
        const handleScroll = () => {
            setScrollPos(window.scrollY + window.scrollX);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useLayoutEffect(() => {
        if (!ref.current) return;
        const {x, y, rotation} = computeFinalPosition(location, layoutState);
        gsap.to(ref.current, {x, y, rotation, duration: 0.3, ease: "power2.out"});
    }, [location.stackLocation, location.index, layoutState]);

    return (
        <div ref={ref} className="card" style={{position: "absolute", zIndex: location.index + 1000}}>
            <CardView card={card} faceUp={location.faceUp}/>
        </div>
    );
}
