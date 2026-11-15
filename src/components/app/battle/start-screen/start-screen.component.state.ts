import type {Settings} from "../../../../services/settings.service.ts";

const CARD_COUNT_OPTIONS = [12, 16, 32, 52];
const DEFAULT_CARD_COUNT = 32;

export const createInitialState = ({musicEnabled, soundsEnabled, cardCount}: Settings) => ({
    // ignore a stored card count that is no longer offered
    cardCount: CARD_COUNT_OPTIONS.includes(cardCount) ? cardCount : DEFAULT_CARD_COUNT,
    cardCountOptions: CARD_COUNT_OPTIONS,
    musicEnabled,
    soundsEnabled,
    isSettingsMenuOpen: false,
});
export const initialState = createInitialState({
    language: null,
    musicEnabled: true,
    soundsEnabled: true,
    cardCount: DEFAULT_CARD_COUNT
});
export type State = ReturnType<typeof createInitialState>;
