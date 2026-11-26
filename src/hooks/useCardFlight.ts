import {type RefObject, useLayoutEffect, useRef} from "react";

const FLIGHT_MS = 260;
const SWAY_PX = 4;
const EASING = "cubic-bezier(.2, .8, .2, 1)";
// the cards of a completed sequence leave one after the other
const COLLECT_MS = 420;
const COLLECT_STAGGER_MS = 35;
const CELEBRATION_MS = 1100;
// the completed sequence rests a moment in its column before it leaves
const JOIN_PAUSE_MS = 120;

// The places of the completed sequences: one child of the element for each sequence, in order
export type Sequences = { count: number, slots: RefObject<HTMLElement | null> };

type Rects = Map<string, DOMRect>;

// Cards fly from where they were to where they are now, so that the eye can follow a move, an undo or a deal.
// Every element with a data-card-id inside the container is followed from one render to the next; a card that was
// not on the table before comes from the element given as origin (the stock). The cards for which isGrounded is true,
// such as cards dragged by the pointer, are left alone.
// When a sequence is completed, its cards leave the table and fly to the place of the sequence, which then shines
// for a moment. An undo brings them back from there.
export const useCardFlight = (
    container: RefObject<HTMLElement | null>,
    origin: RefObject<HTMLElement | null>,
    sequences?: Sequences,
    isGrounded: (element: HTMLElement) => boolean = () => false,
) => {
    // where each card lies once landed, without the shift of a flight under way
    const previous = useRef<Rects>(new Map());
    const flights = useRef(new WeakMap<HTMLElement, Animation>());
    const viewport = useRef({width: 0, height: 0});
    // the elements of the cards, kept to fly the collected ones after they have left the table
    const previousElements = useRef(new Map<string, HTMLElement>());
    const previousCount = useRef(sequences?.count ?? 0);
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
        const beforeElements = previousElements.current;
        previousElements.current = new Map([...elements].map(element => [element.dataset.cardId ?? "", element]));
        const count = sequences?.count ?? 0;
        const countBefore = previousCount.current;
        previousCount.current = count;
        if (resized || reduced || before.size === 0) return;
        const slotOf = (index: number) => sequences?.slots.current?.children.item(index) as HTMLElement | null | undefined;
        if (count > countBefore && container.current) {
            const left = [...before.keys()].filter(id => !rects.has(id))
                .map(id => ({rect: before.get(id), element: beforeElements.get(id)}))
                .filter((card): card is { rect: DOMRect, element: HTMLElement } => card.rect !== undefined && card.element !== undefined && !card.element.isConnected);
            collect(container.current, left, slotOf(count - 1));
        }
        // after an undo, the cards of the sequence come back from its place
        const originRect = (count === countBefore - 1 ? slotOf(count) : origin.current)?.getBoundingClientRect();
        elements.forEach(element => {
            if (isGrounded(element) || typeof element.animate !== "function") return;
            const now = rects.get(element.dataset.cardId ?? "");
            const from = onScreen.get(element) ?? before.get(element.dataset.cardId ?? "") ?? originRect;
            if (!now || !from) return;
            const dx = from.left - now.left;
            const dy = from.top - now.top;
            // a few pixels are the sway of a selected card, not a move
            if (Math.abs(dx) < SWAY_PX && Math.abs(dy) < SWAY_PX) return;
            flights.current.set(element, element.animate([
                {transform: `translate(${dx}px, ${dy}px)`, zIndex: 50},
                {transform: "translate(0, 0)", zIndex: 50},
            ], {duration: FLIGHT_MS, easing: EASING}));
        });
    });
};

// The cards that left the table fly over it to the place of their sequence, then the place shines for a moment
const collect = (table: HTMLElement, cards: { rect: DOMRect, element: HTMLElement }[], slot: HTMLElement | null | undefined) => {
    if (!slot || cards.length === 0 || typeof table.animate !== "function") return;
    const target = slot.getBoundingClientRect();
    const layer = document.createElement("div");
    layer.className = "card-flight-layer";
    table.appendChild(layer);
    // the sequence shows in its place once its cards have arrived
    slot.classList.add("spider-slot--waiting");
    // the ace leaves first and the king last, as when the sequence is picked up from the top
    const rank = (element: HTMLElement) => Number(element.dataset.rank ?? 0);
    const aceFirst = [...cards].sort((a, b) => rank(a.element) - rank(b.element) || b.rect.top - a.rect.top);
    aceFirst.forEach(({rect, element}) => {
        element.className = "spider-card";
        // out of the table, the card is no longer followed from one render to the next
        element.removeAttribute("data-card-id");
        Object.assign(element.style, {
            position: "absolute", left: `${rect.left}px`, top: `${rect.top}px`,
            width: `${rect.width}px`, height: `${rect.height}px`, transform: "", transformOrigin: "0 0",
        });
        // each card goes under the ones before it: the ace lies on the two, ..., the queen on the king
        layer.prepend(element);
    });
    // the cards that completed the sequence first land on the rest of it, in its column
    const landings = landingsOf(aceFirst);
    const joins = aceFirst.flatMap(({rect, element}, index) => {
        const landing = landings[index];
        if (landing.left === rect.left && landing.top === rect.top) return [];
        return [element.animate([
            {transform: "translate(0, 0)"},
            {transform: `translate(${landing.left - rect.left}px, ${landing.top - rect.top}px)`},
        ], {duration: FLIGHT_MS, easing: EASING, fill: "forwards"})];
    });
    const leave = () => Promise.all(aceFirst.map(({element}, index) => {
        const from = landings[index];
        const scale = target.width / from.width;
        return element.animate([
            {transform: `translate(${from.left - parseFloat(element.style.left)}px, ${from.top - parseFloat(element.style.top)}px) scale(1)`},
            {transform: `translate(${target.left - parseFloat(element.style.left)}px, ${target.top - parseFloat(element.style.top)}px) scale(${scale})`},
        ], {duration: COLLECT_MS, delay: index * COLLECT_STAGGER_MS, easing: "cubic-bezier(.4, 0, .2, 1)", fill: "forwards"}).finished;
    }));
    const landed = () => {
        layer.remove();
        slot.classList.remove("spider-slot--waiting");
        slot.classList.add("spider-slot--won");
        setTimeout(() => slot.classList.remove("spider-slot--won"), CELEBRATION_MS);
    };
    Promise.all(joins.map(join => join.finished))
        .then(() => new Promise(resolve => setTimeout(resolve, joins.length > 0 ? JOIN_PAUSE_MS : 0)))
        .then(leave)
        .then(landed, landed);
};

// Where each card lies once the sequence is whole in the column of its king: the cards already there stay,
// the others go below the last of them, with the same spacing
const landingsOf = (aceFirst: { rect: DOMRect }[]): { left: number, top: number, width: number }[] => {
    const king = aceFirst[aceFirst.length - 1].rect;
    const inColumn = (rect: DOMRect) => Math.abs(rect.left - king.left) < 1;
    const kingFirst = [...aceFirst].reverse();
    const staying = kingFirst.findIndex(card => !inColumn(card.rect));
    if (staying === -1) return aceFirst.map(({rect}) => rect);
    const rest = kingFirst.slice(0, staying);
    const last = rest[rest.length - 1].rect;
    const step = rest.length > 1 ? (last.top - rest[0].rect.top) / (rest.length - 1) : last.height * 0.25;
    return kingFirst.map(({rect}, index) => index < staying ? rect : {left: last.left, top: last.top + step * (index - staying + 1), width: last.width})
        .reverse();
};
