// The size of a card, the same in every game

// height / width of a card face (the SVG faces are 143 × 200)
export const CARD_RATIO = 200 / 143;
// a card narrower than this is drawn compact (value and suit, no picture), so that it stays readable
export const COMPACT_CARD_MAX_WIDTH_PX = 60;
export const isCompactWidth = (width: number) => width < COMPACT_CARD_MAX_WIDTH_PX;
