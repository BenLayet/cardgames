export const createInitialState = (hasSavedGame: boolean) => ({
    isStarted: false,
    // a game in progress was saved and can be resumed
    hasSavedGame,
});

export type State = ReturnType<typeof createInitialState>;
