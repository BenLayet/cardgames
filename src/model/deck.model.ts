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

export const DECK: Card[] = SUITS.reduce(
    (acc, suit) => acc.concat(RANKS.map((rank): Card => `${rank}${suit}`)),
    [] as Card[],
);
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