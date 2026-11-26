import type {Card, StackLocation} from "../../model/deck.model.ts";

// How askew a card lies on the table, as when put down by hand

function fakeRandom(seed: number) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

function translateRangeKeeping0(value: number) {
    return (value + 1.5) % 1 - 0.5;
}

// a number for a card on a stack (FNV-1a): the same card keeps its tilt on the same stack, whatever its place in it
function tiltSeed(card: Card, stackLocation: StackLocation) {
    let hash = 0x811c9dc5;
    for (const char of `${card}@${stackLocation}`) hash = Math.imul(hash ^ char.charCodeAt(0), 0x01000193);
    return hash >>> 0;
}

// the tilt of a card on a stack, in degrees: from -messyLevel / 2 to messyLevel / 2
export const cardTilt = (card: Card, stackLocation: StackLocation, messyLevel: number) =>
    translateRangeKeeping0(fakeRandom(tiltSeed(card, stackLocation))) * messyLevel;
