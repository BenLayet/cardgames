import {type RefObject, useLayoutEffect, useRef} from "react";

const FLIGHT_MS = 260;
const EASING = "cubic-bezier(.2, .8, .2, 1)";

type Rects = Map<string, DOMRect>;

// Cards fly from where they were to where they are now, so that the eye can follow a move, an undo or a deal.
// Every element with a data-card-id inside the container is followed from one render to the next; a card that was
// not on the table before comes from the element given as origin (the stock). Dragged cards follow the pointer and
// are left alone.
export const useCardFlight = (container: RefObject<HTMLElement | null>, origin: RefObject<HTMLElement | null>) => {
    // where each card lies once landed, without the shift of a flight under way
    const previous = useRef<Rects>(new Map());
    const flights = useRef(new WeakMap<HTMLElement, Animation>());
    const viewport = useRef({width: 0, height: 0});
    useLayoutEffect(() => {
        const elements = container.current?.querySelectorAll<HTMLElement>("[data-card-id]") ?? [];
        // a card still flying is seen where it is on screen, then measured where it lands:
        // a render during a flight must not take the shifted card for its landing place
        const onScreen = new Map<HTMLElement, DOMRect>();
        const rects: Rects = new Map();
        elements.forEach(element => {
            const flight = flights.current.get(element);
            if (flight?.playState === "running") {
                onScreen.set(element, element.getBoundingClientRect());
                flight.cancel();
            }
            rects.set(element.dataset.cardId ?? "", element.getBoundingClientRect());
        });
        // a new size of the screen moves every card: nothing flies then
        const resized = viewport.current.width !== window.innerWidth || viewport.current.height !== window.innerHeight;
        viewport.current = {width: window.innerWidth, height: window.innerHeight};
        const reduced = typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const before = previous.current;
        previous.current = rects;
        if (resized || reduced || before.size === 0) return;
        const originRect = origin.current?.getBoundingClientRect();
        elements.forEach(element => {
            if (element.classList.contains("spider-card--dragged") || typeof element.animate !== "function") return;
            const now = rects.get(element.dataset.cardId ?? "");
            const from = onScreen.get(element) ?? before.get(element.dataset.cardId ?? "") ?? originRect;
            if (!now || !from) return;
            const dx = from.left - now.left;
            const dy = from.top - now.top;
            if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;
            flights.current.set(element, element.animate([
                {transform: `translate(${dx}px, ${dy}px)`, zIndex: 50},
                {transform: "translate(0, 0)", zIndex: 50},
            ], {duration: FLIGHT_MS, easing: EASING}));
        });
    });
};
