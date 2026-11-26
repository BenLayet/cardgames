// How long each step of a round lasts, in milliseconds
export const DELAYS_MS = {
    // between the deal request and the cards being on the table
    deal: 500,
    // the computer plays a little after the player, to give the impression of an answer
    computerAnswer: 100,
    // the last card played reaches the middle of the table before the round is resolved
    suspense: 500,
    // a short look at all the cards before the winner, or the battle, is shown
    reviewWinner: 300,
    // the cards fly to the pile of the winner before the next round
    collected: 600,
} as const;
