import {DECK} from "../model/deck.model.ts";
import type {BattleSaveService, SavedBattleGame, SavedBattlePlayer} from "../services/battle-save.service.ts";

const STORAGE_KEY = "cardgames.bataille.game";

const isObject = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null;
const isCardList = (value: unknown) => Array.isArray(value) && value.every(card => (DECK as unknown[]).includes(card));
const isPlayer = (value: unknown): value is SavedBattlePlayer => isObject(value)
    && isCardList(value.remainingCards) && isCardList(value.wonCards) && isCardList(value.beingPlayedCards)
    && Array.isArray(value.beingPlayedCardsUpStates) && value.beingPlayedCardsUpStates.every(up => typeof up === "boolean");
const isName = (value: unknown) => value === null || typeof value === "string";

// a stored game that does not have this shape is ignored, as if there was none
export const decodeSavedBattleGame = (text: string): SavedBattleGame | null => {
    try {
        const game: unknown = JSON.parse(text);
        if (!isObject(game) || !isPlayer(game.player1) || !isPlayer(game.player2)) return null;
        if (typeof game.isPlayer2Computer !== "boolean" || typeof game.hasPlayed !== "boolean") return null;
        if (!Array.isArray(game.playerNames) || !game.playerNames.every(isName)) return null;
        if (![null, "player1", "player2"].includes(game.lastRoundWinner as string | null)) return null;
        return game as SavedBattleGame;
    } catch {
        return null;
    }
};

// Stores the game in the browser; without storage (private mode, blocked...) the game is simply not kept
export class LocalStorageBattleSaveAdapter implements BattleSaveService {
    load(): SavedBattleGame | null {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored === null ? null : decodeSavedBattleGame(stored);
        } catch {
            return null;
        }
    }

    hasSavedGame(): boolean {
        return this.load() !== null;
    }

    save(game: SavedBattleGame): void {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(game));
        } catch (error) {
            console.error("Failed to save the Bataille game:", error);
        }
    }

    clear(): void {
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (error) {
            console.error("Failed to clear the Bataille game:", error);
        }
    }
}
