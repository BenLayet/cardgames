import type {GameId} from "../../model/games.model.ts";

// the home page, or the game being set up or played
export type Page = "HOME" | GameId;
export const initialState = {
    page: "HOME" as Page,
};
export type State = typeof initialState;
