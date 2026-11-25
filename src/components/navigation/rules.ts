import type {GameId} from "../../model/games.model.ts";

// the games that have their rules written, see "rules" in the translations
const GAMES_WITH_RULES = ["bataille", "spider"] as const;
export type GameWithRules = (typeof GAMES_WITH_RULES)[number];
export const hasRules = (gameId: GameId): gameId is GameWithRules => (GAMES_WITH_RULES as readonly GameId[]).includes(gameId);
