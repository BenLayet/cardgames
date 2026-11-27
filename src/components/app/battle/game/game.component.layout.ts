import {MAX_STACK_DEPTH} from "../../../card/AnimatedCardView.tsx";
import {CARD_RATIO} from "../../../card/card-size.ts";

// Where the piles and the cards played of a Bataille game lie on the table, for 2 to 6 players.
// The piles sit around the table: seat 0 at the bottom, the others clockwise, as in the "Bataille à six" mockup;
// two players sit in opposite corners, player 1 at the bottom left and player 2 at the top right.
// The cards played lie in the middle of the table, in a centred grid of slots, one per player still in the game,
// in seat order, on 1, 2 or 3 rows: the one that gives the largest cards without any slot, pile or name overlapping another.
// A player who leaves the game loses their slot: the others are centred again, and may grow.

// the centre of each pile, in percent of the table, when the table is upright or wide
const UPRIGHT: Record<number, [number, number][]> = {
    2: [[18, 88], [82, 12]],
    3: [[50, 86], [20, 12], [80, 12]],
    4: [[50, 88], [10, 50], [50, 12], [90, 50]],
    5: [[50, 88], [10, 62], [22, 12], [78, 12], [90, 62]],
    6: [[25, 88], [10, 50], [25, 12], [75, 12], [90, 50], [75, 88]],
};
const WIDE: Record<number, [number, number][]> = {
    2: [[22, 80], [78, 20]],
    3: [[50, 83], [12, 22], [88, 22]],
    4: [[50, 85], [8, 50], [50, 15], [92, 50]],
    5: [[50, 85], [8, 62], [25, 15], [75, 15], [92, 62]],
    6: [[25, 85], [8, 50], [25, 15], [75, 15], [92, 50], [75, 85]],
};
// the largest card, in part of the table width and height, the smaller one is taken
const MAX_CARD_UPRIGHT: [number, number] = [0.3, 0.15];
const MAX_CARD_WIDE: [number, number] = [0.13, 0.22];
const MIN_CARD_WIDTH = 24;

// where the name and the card count of a seat are written, next to its pile: away from the centre of the table
export type LabelSide = "below" | "above" | "left" | "right";
type Point = { x: number, y: number };
type Box = { left: number, top: number, right: number, bottom: number };
export type SeatLayout = {
    // the centre of the pile, and of the cards played, piled on each other, in pixels from the top left corner of the table
    pile: Point,
    played: Point,
    // false for a player out of the game: no slot is drawn for them
    hasSlot: boolean,
    labelSide: LabelSide,
};
export type TableLayout = { cardWidth: number, cardHeight: number, rows: number, seats: SeatLayout[] };

// room for a label, in pixels
const LABEL_HEIGHT = 34;
const LABEL_WIDTH = 112;
const GAP = 8;

// the cards lie a little askew, as when put down by hand: up to 3° on the piles, 6° in the middle of the table
export const PILE_TILT_DEG = 3;
export const PLAYED_TILT_DEG = 6;
// how far a card tilted by the largest angle goes past its slot, on each side
const tiltOverhang = (cardWidth: number, cardHeight: number) => {
    const angle = PLAYED_TILT_DEG * Math.PI / 180;
    return {
        x: cardWidth / 2 * (Math.cos(angle) - 1) + cardHeight / 2 * Math.sin(angle),
        y: cardHeight / 2 * (Math.cos(angle) - 1) + cardWidth / 2 * Math.sin(angle),
    };
};
// the room between two slots: a gap, plus what two tilted cards and a stack of cards played go past their slots
const slotGaps = (cardWidth: number, cardHeight: number) => {
    const overhang = tiltOverhang(cardWidth, cardHeight);
    return {x: GAP + 2 * overhang.x + MAX_STACK_DEPTH / 2, y: GAP + 2 * overhang.y + MAX_STACK_DEPTH};
};

const labelSide = (count: number, isWide: boolean, x: number, y: number): LabelSide => {
    // two players: each name is written beside the pile, towards the middle of the table
    if (count === 2) return x < 50 ? "right" : "left";
    if (!isWide) return y < 40 ? "above" : "below";
    if (x < 20 || x > 80) return "below";
    return x <= 50 ? "left" : "right";
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), Math.max(min, max));
const overlap = (a: Box, b: Box) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;

type Pile = { centre: Point, side: LabelSide, box: Box };
// a pile, with its name and its outline, kept on the table
const placePile = (px: number, py: number, side: LabelSide, width: number, height: number, cardWidth: number, cardHeight: number): Pile => {
    const above = cardHeight / 2 + GAP + (side === "above" ? LABEL_HEIGHT : 0);
    const below = cardHeight / 2 + GAP + (side === "below" ? LABEL_HEIGHT : 0);
    const left = cardWidth / 2 + GAP + (side === "left" ? LABEL_WIDTH : 0);
    const right = cardWidth / 2 + GAP + (side === "right" ? LABEL_WIDTH : 0);
    const centre = {
        x: clamp(px / 100 * width, left, width - right),
        y: clamp(py / 100 * height, above, height - below),
    };
    return {centre, side, box: {left: centre.x - left, top: centre.y - above, right: centre.x + right, bottom: centre.y + below}};
};

// the grid of slots, centred on the table
const slotGrid = (count: number, rows: number, width: number, height: number, cardWidth: number, cardHeight: number) => {
    const columns = Math.ceil(count / rows);
    const gap = slotGaps(cardWidth, cardHeight);
    const gridWidth = columns * cardWidth + (columns - 1) * gap.x;
    const gridHeight = rows * cardHeight + (rows - 1) * gap.y;
    const box: Box = {
        left: (width - gridWidth) / 2, top: (height - gridHeight) / 2,
        right: (width + gridWidth) / 2, bottom: (height + gridHeight) / 2,
    };
    // the centre of each slot, row after row; a last row with fewer slots is centred
    const slots = Array.from({length: count}, (_, index): Point => {
        const row = Math.floor(index / columns);
        const inRow = Math.min(columns, count - row * columns);
        const rowWidth = inRow * cardWidth + (inRow - 1) * gap.x;
        const column = index - row * columns;
        return {
            x: (width - rowWidth) / 2 + column * (cardWidth + gap.x) + cardWidth / 2,
            y: box.top + row * (cardHeight + gap.y) + cardHeight / 2,
        };
    });
    return {box, slots};
};

const fits = (count: number, slotCount: number, rows: number, isWide: boolean, width: number, height: number, cardWidth: number): boolean => {
    const cardHeight = cardWidth * CARD_RATIO;
    const {box} = slotGrid(slotCount, rows, width, height, cardWidth, cardHeight);
    if (box.left < GAP || box.top < GAP) return false;
    const piles = (isWide ? WIDE : UPRIGHT)[count].map(([px, py]) =>
        placePile(px, py, labelSide(count, isWide, px, py), width, height, cardWidth, cardHeight));
    // a pile pushed against an edge of a too small table goes over it
    if (piles.some(({box}) => box.left < 0 || box.top < 0 || box.right > width || box.bottom > height)) return false;
    // the tilted cards and the stack of cards played go past the grid of slots
    const overhang = tiltOverhang(cardWidth, cardHeight);
    // (a stack of cards played rises and shifts right)
    const grid: Box = {
        left: box.left - GAP - overhang.x, right: box.right + GAP + overhang.x + MAX_STACK_DEPTH / 2,
        top: box.top - GAP - overhang.y - MAX_STACK_DEPTH, bottom: box.bottom + GAP + overhang.y,
    };
    return piles.every((pile, index) => !overlap(pile.box, grid)
        && piles.slice(index + 1).every(other => !overlap(pile.box, other.box)));
};

// the largest card width that fits, to the pixel, or 0 when even the smallest card does not fit
const largestCardWidth = (count: number, slotCount: number, rows: number, isWide: boolean, width: number, height: number, maxWidth: number): number => {
    const fitsWith = (cardWidth: number) => fits(count, slotCount, rows, isWide, width, height, cardWidth);
    if (!fitsWith(MIN_CARD_WIDTH)) return 0;
    let low = MIN_CARD_WIDTH, high = Math.max(MIN_CARD_WIDTH, Math.floor(maxWidth));
    if (fitsWith(high)) return high;
    while (high - low > 1) {
        const middle = Math.floor((low + high) / 2);
        if (fitsWith(middle)) low = middle;
        else high = middle;
    }
    return low;
};

// the seats with a slot in the middle: those still in the game (all of them when not given);
// a seat without a slot has its cards played drawn on its pile
export const tableLayout = (playerCount: number, width: number, height: number, slotSeats?: readonly number[]): TableLayout => {
    const isWide = width > height;
    const count = clamp(Math.round(playerCount), 2, 6);
    const withSlot = (slotSeats ?? Array.from({length: count}, (_, index) => index)).filter(seat => seat >= 0 && seat < count);
    const slotCount = Math.max(1, withSlot.length);
    const [widthPart, heightPart] = isWide ? MAX_CARD_WIDE : MAX_CARD_UPRIGHT;
    const maxWidth = Math.min(width * widthPart, height * heightPart);
    // the fewest rows win a tie;
    // two slots always lie side by side
    const best = [1, 2, 3].filter(rows => rows <= slotCount && (slotCount > 2 || rows === 1))
        .map(rows => ({rows, cardWidth: largestCardWidth(count, slotCount, rows, isWide, width, height, maxWidth)}))
        .reduce((a, b) => b.cardWidth > a.cardWidth ? b : a);
    const cardWidth = Math.max(MIN_CARD_WIDTH, best.cardWidth);
    const rows = best.cardWidth > 0 ? best.rows : Math.min(3, slotCount);
    const cardHeight = cardWidth * CARD_RATIO;
    const {slots} = slotGrid(slotCount, rows, width, height, cardWidth, cardHeight);
    const seats = (isWide ? WIDE : UPRIGHT)[count].map(([px, py], index): SeatLayout => {
        const side = labelSide(count, isWide, px, py);
        const {centre} = placePile(px, py, side, width, height, cardWidth, cardHeight);
        const slot = withSlot.indexOf(index);
        return {pile: centre, played: slot >= 0 ? slots[slot] : centre, hasSlot: slot >= 0, labelSide: side};
    });
    return {cardWidth, cardHeight, rows, seats};
};

// the seat whose pile is the nearest to a point of the table, among the given ones
export const nearestSeat = (layout: TableLayout, seats: number[], point: Point): number | null =>
    seats.reduce<number | null>((nearest, seat) => {
        if (nearest === null) return seat;
        const distance = (index: number) => Math.hypot(layout.seats[index].pile.x - point.x, layout.seats[index].pile.y - point.y);
        return distance(seat) < distance(nearest) ? seat : nearest;
    }, null);

// the keys of the players sharing a keyboard, from seat 0 to seat 5: far apart, so that each one has room for a hand,
// and at the same place on AZERTY and QWERTY keyboards except A and M
const PLAYER_KEYS = ["l", "a", "g", "p", "x", "m"] as const;
// two players sit in opposite corners: each one plays with the key on the side of their pile,
// player 1 (bottom left) with A, player 2 (top right) with L
const TWO_PLAYER_KEYS = ["a", "l"] as const;
export const playerKeys = (seatCount: number): readonly string[] => seatCount === 2 ? TWO_PLAYER_KEYS : PLAYER_KEYS;
