import {DEFAULT_SETTINGS, type Settings} from "../../../../services/settings.service.ts";

const CARD_COUNT_OPTIONS = [12, 16, 32, 52];

export const createInitialState = ({cardCount}: Settings) => ({
    // ignore a stored card count that is no longer offered
    cardCount: CARD_COUNT_OPTIONS.includes(cardCount) ? cardCount : DEFAULT_SETTINGS.cardCount,
    cardCountOptions: CARD_COUNT_OPTIONS,
});
export const initialState = createInitialState(DEFAULT_SETTINGS);
export type State = ReturnType<typeof createInitialState>;
