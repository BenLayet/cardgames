export const createInitialState = (savedSuitCounts: number[]) => ({
    isStarted: false,
    // the numbers of suits that have a game in progress to resume
    savedSuitCounts,
});

export type State = ReturnType<typeof createInitialState>;
