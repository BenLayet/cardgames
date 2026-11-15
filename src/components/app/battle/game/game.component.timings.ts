// How long each step of a round lasts, in milliseconds
export const DELAYS_MS = {
    // between the deal request and the cards being on the table
    deal: 500,
    // player 2 plays a little after player 1, to give the impression of an answer
    player2Answer: 100,
    // before the played cards are turned over
    suspense: 600,
    // to look at the turned over cards before the round is resolved
    reviewWinner: 1000,
    // to see a revealed hidden pair before it goes to the winner's stack
    revealedPair: 1500,
    // between two pairs going to the winner's stack
    pairTransferPause: 300,
} as const;
