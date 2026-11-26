import type {BattleVariant} from "../../../services/battle-save.service.ts";

export const createInitialState = (savedVariants: BattleVariant[]) => ({
    isStarted: false,
    // the kinds of game (players and number of cards) that have a game to resume
    savedVariants,
});

export type State = ReturnType<typeof createInitialState>;
