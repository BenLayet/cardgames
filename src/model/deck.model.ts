export const SUITS = ["S", "H", "D", "C"] as const;
export type Suit = (typeof SUITS)[number];
export const RANKS = ["2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K", "A"] as const;
export type Rank = (typeof RANKS)[number];
export type Card = `${Rank}${Suit}`;
// a stack of cards on the table; each game names its own stacks (Bataille: BattleStackLocation)
export type StackLocation = string;

export type CardPlacement<Location extends StackLocation = StackLocation> = {
    faceUp: boolean;
    stackLocation: Location;
    stackIndex: number;
    index: number;
    messyLevel: number;
};
export type CardWithPlacement<Location extends StackLocation = StackLocation> = {
    card: Card;
    placement: CardPlacement<Location>;
};
export const createDeck = (cardCount: number): Card[] => {
    if (cardCount % SUITS.length !== 0) {
        throw new Error("Card count must be a multiple of 4 to create a balanced deck.");
    }
    if (cardCount > SUITS.length * RANKS.length) {
        throw new Error(`Card count cannot exceed ${SUITS.length * RANKS.length} for a standard deck.`);
    }
    if (cardCount < SUITS.length) {
        throw new Error("Card count must be at least 4 to create a deck with all suits represented.");
    }
    const rankCount = cardCount / SUITS.length;
    const ranksToUse = RANKS.slice(RANKS.length - rankCount);
    return SUITS.reduce<Card[]>(
        (acc, suit) => acc.concat(ranksToUse.map((rank): Card => `${rank}${suit}`)),
        [],
    );
}
export const DECK: Card[] = createDeck(SUITS.length * RANKS.length);
export const rankValue = (rank: Rank) => RANKS.indexOf(rank);
export const cardValue = (card: Card) => rankValue(card.charAt(0) as Rank);
export const isFirstCardHigherValue = (card1: Card | undefined, card2: Card | undefined): boolean =>
    !!card1 &&
    !!card2 &&
    cardValue(card1) > cardValue(card2);

// random() returns a number from 0 included to 1 excluded, like Math.random
export function shuffleDeck(deck: Card[], random: () => number = Math.random): Card[] {
    const shuffledDeck = [...deck];
    for (let i = shuffledDeck.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [shuffledDeck[i], shuffledDeck[j]] = [shuffledDeck[j], shuffledDeck[i]];
    }
    return shuffledDeck;
}

// The same seed always gives the same numbers, so that a shuffle can be replayed from its seed (mulberry32)
export const seededRandom = (seed: number): () => number => {
    let state = seed | 0;
    return () => {
        state = (state + 0x6D2B79F5) | 0;
        let t = Math.imul(state ^ (state >>> 15), 1 | state);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
};