// Where the seats of a Bataille game sit around the table, for 2 to 6 players:
// seat 0 at the bottom, the others clockwise, as in the "Bataille à six" mockup.
// Two players sit in opposite corners, player 1 at the bottom left and player 2 at the top right,
// and lay their cards side by side in the middle of the table.

// the centre of each seat, in percent of the table, when the table is upright or wide
const UPRIGHT: Record<number, [number, number][]> = {
    2: [[18, 88], [82, 12]],
    3: [[50, 86], [24, 15], [76, 15]],
    4: [[50, 86], [15, 50], [50, 14], [85, 50]],
    5: [[50, 86], [15, 60], [25, 14], [75, 14], [85, 60]],
    6: [[27, 86], [14, 50], [27, 14], [73, 14], [86, 50], [73, 86]],
};
const WIDE: Record<number, [number, number][]> = {
    2: [[22, 80], [78, 20]],
    3: [[50, 83], [17, 24], [83, 24]],
    4: [[50, 83], [11, 50], [50, 17], [89, 50]],
    5: [[50, 83], [11, 62], [30, 17], [70, 17], [89, 62]],
    6: [[31, 83], [10, 50], [31, 17], [69, 17], [90, 50], [69, 83]],
};
// the cards get smaller from 3 players and again from 5: the largest width of a card, in part of the table width and
// height, the smaller one is taken
const CARD_SIZE_UPRIGHT: Record<number, [number, number]> = {2: [0.3, 0.15], 3: [0.22, 0.11], 4: [0.22, 0.11], 5: [0.18, 0.09], 6: [0.18, 0.09]};
const CARD_SIZE_WIDE: Record<number, [number, number]> = {2: [0.13, 0.22], 3: [0.11, 0.18], 4: [0.11, 0.18], 5: [0.1, 0.16], 6: [0.1, 0.16]};
export const CARD_RATIO = 200 / 143;

// where the name and the card count of a seat are written, next to its pile: away from the centre of the table
export type LabelSide = "below" | "above" | "left" | "right";
type Point = { x: number, y: number };
export type SeatLayout = {
    // the centre of the pile, and of the cards played in front of it, in pixels from the top left corner of the table
    pile: Point,
    played: Point,
    // how far each card of a battle is moved aside from the card under it, in pixels
    fan: Point,
    labelSide: LabelSide,
};
export type TableLayout = { cardWidth: number, cardHeight: number, seats: SeatLayout[] };

// room for a label, in pixels
const LABEL_HEIGHT = 34;
const LABEL_WIDTH = 96;
const GAP = 6;
// with 3 players or more, a card of a battle is moved aside by part of its size, to the right and down
const FAN_X = 0.07;
const FAN_Y = 0.08;
// with 2 players, the cards of a battle are spread further, away from the other player's cards:
// sideways on a wide table, towards the own pile on an upright one, so that each card's corner can be read
const TWO_PLAYER_FAN_X = 0.3;
const TWO_PLAYER_FAN_Y = 0.22;

const labelSide = (count: number, isWide: boolean, x: number, y: number): LabelSide => {
    // two players: each name is written beside the pile, towards the middle of the table
    if (count === 2) return x < 50 ? "right" : "left";
    if (!isWide) return y < 40 ? "above" : "below";
    if (x < 20 || x > 80) return "below";
    return x <= 50 ? "left" : "right";
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), Math.max(min, max));

export const tableLayout = (playerCount: number, width: number, height: number): TableLayout => {
    const isWide = width > height;
    const count = clamp(Math.round(playerCount), 2, 6);
    const [widthPart, heightPart] = (isWide ? CARD_SIZE_WIDE : CARD_SIZE_UPRIGHT)[count];
    const cardWidth = Math.max(24, Math.min(width * widthPart, height * heightPart));
    const cardHeight = cardWidth * CARD_RATIO;
    const centre = {x: width / 2, y: height / 2};
    const seats = (isWide ? WIDE : UPRIGHT)[count].map(([px, py], index): SeatLayout => {
        const side = labelSide(count, isWide, px, py);
        // the pile and its label stay on the table
        const roomAbove = cardHeight / 2 + GAP + (side === "above" ? LABEL_HEIGHT : 0);
        const roomBelow = cardHeight / 2 + GAP + (side === "below" ? LABEL_HEIGHT : 0);
        const roomLeft = cardWidth / 2 + GAP + (side === "left" ? LABEL_WIDTH : 0);
        const roomRight = cardWidth / 2 + GAP + (side === "right" ? LABEL_WIDTH : 0);
        const pile = {
            x: clamp(px / 100 * width, roomLeft, width - roomRight),
            y: clamp(py / 100 * height, roomAbove, height - roomBelow),
        };
        if (count === 2) {
            // player 1's cards on the left of the centre, player 2's on the right
            const towardsRight = index === 0 ? -1 : 1;
            const towardsPile = index === 0 ? 1 : -1;
            return {
                pile,
                played: {x: centre.x + towardsRight * (cardWidth + GAP) / 2, y: centre.y},
                fan: isWide
                    ? {x: towardsRight * TWO_PLAYER_FAN_X * cardWidth, y: 0}
                    : {x: 0, y: towardsPile * TWO_PLAYER_FAN_Y * cardHeight},
                labelSide: side,
            };
        }
        // the cards played lie just inside the seat, on the line to the centre of the table,
        // far enough to clear the pile and its label on one axis
        let dx = centre.x - pile.x, dy = centre.y - pile.y;
        const length = Math.hypot(dx, dy) || 1;
        dx /= length;
        dy /= length;
        const needY = cardHeight + GAP;
        const needX = cardWidth + GAP;
        const distance = Math.min(
            Math.abs(dy) > 0.05 ? needY / Math.abs(dy) : Infinity,
            Math.abs(dx) > 0.05 ? needX / Math.abs(dx) : Infinity,
            length,
        );
        return {
            pile,
            played: {x: pile.x + dx * distance, y: pile.y + dy * distance},
            fan: {x: FAN_X * cardWidth, y: FAN_Y * cardHeight},
            labelSide: side,
        };
    });
    return {cardWidth, cardHeight, seats};
};

// the seat whose pile is the nearest to a point of the table, among the given ones
export const nearestSeat = (layout: TableLayout, seats: number[], point: Point): number | null =>
    seats.reduce<number | null>((nearest, seat) => {
        if (nearest === null) return seat;
        const distance = (index: number) => Math.hypot(layout.seats[index].pile.x - point.x, layout.seats[index].pile.y - point.y);
        return distance(seat) < distance(nearest) ? seat : nearest;
    }, null);
