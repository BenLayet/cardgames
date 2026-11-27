// How AnimatedCardView moves the cards that are raised or won, shared with the games that draw around them

// a raised card (the card that won a round): how high it rises, in part of its height, and how much it grows
export const RAISE = {height: 0.16, scale: 1.12};

// the flight of a card won: up in an arc to where it lands, then under its stack
export const LANDING_MS = 900;
// the part of the flight spent before landing, then the card slides under its stack
export const LANDED_AT = 0.7;
// when the card lands, from the start of its flight
export const LANDED_MS = LANDING_MS * LANDED_AT;
