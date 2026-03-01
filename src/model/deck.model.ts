export const SUITS = ["S", "H", "D", "C"] as const;
export type Suit = (typeof SUITS)[number];
export const RANKS = ["2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K", "A"] as const;
export type Rank = (typeof RANKS)[number];
export type Card = `${Rank}${Suit}`;
export type StackLocation =
    | "deck"
    | "player1RemainingCards"
    | "player1WonCards"
    | "player1BeingPlayedCards"
    | "player2RemainingCards"
    | "player2WonCards"
    | "player2BeingPlayedCards";
export type CardLocation = {
    faceUp: boolean;
    stackLocation: StackLocation;
    index: number;
    messyLevel: number;
}
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
    return SUITS.reduce(
        (acc, suit) => acc.concat(ranksToUse.map((rank): Card => `${rank}${suit}`)),
        [] as Card[],
    );
}
export const DECK: Card[] = createDeck(SUITS.length * RANKS.length);
export const rankValue = (rank: Rank) => RANKS.indexOf(rank as (typeof RANKS)[number]);
export const cardValue = (card: Card) => rankValue(card.charAt(0) as Rank);
export const isFirstCardHigherValue = (card1: Card | undefined, card2: Card | undefined): boolean =>
    !!card1 &&
    !!card2 &&
    cardValue(card1) > cardValue(card2);

export function shuffleDeck(deck: Card[]): Card[] {
    const shuffledDeck = [...deck];
    for (let i = shuffledDeck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledDeck[i], shuffledDeck[j]] = [shuffledDeck[j], shuffledDeck[i]];
    }
    return shuffledDeck;
}