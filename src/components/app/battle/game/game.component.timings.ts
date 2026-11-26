// How long each step of a round lasts, in milliseconds
export const DELAYS_MS = {
    // between the deal request and the cards being on the table
    deal: 500,
    // the computer plays a little after the player, to give the impression of an answer
    computerAnswer: 100,
    // before the played cards are turned over
    suspense: 600,
    // to look at the turned over cards before the round is resolved
    reviewWinner: 1000,
    // to see the face down cards of a battle before they go to the winner
    revealedCards: 1500,
    // the cards fly to the pile of the winner before the next round
    collected: 600,
} as const;
