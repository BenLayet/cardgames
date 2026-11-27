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
    // the cards fly to the pile of the winner, and go under it (LANDING_MS in AnimatedCardView), before the next round
    collected: 1000,
    // once a round is won, each step of the collection (turning over a hidden layer, collecting a layer) is done on its own
    // when nobody taps: long enough to see the winning card and its sparks, short enough to keep the game going (#175)
    autoCollect: 2000,
} as const;
