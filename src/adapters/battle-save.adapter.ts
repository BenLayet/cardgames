import {DECK} from "../model/deck.model.ts";
import {LocalStorageVariantStore} from "./local-storage-variant-store.ts";
import {type BattleSaveService, type BattleVariant, type SavedBattleGame, variantOfSavedGame} from "../services/battle-save.service.ts";

// version 1, without a version number, was a game between two players with a pile of won cards each
const VERSION = 2;

const isObject = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null;
const isCardList = (value: unknown) => Array.isArray(value) && value.every(card => (DECK as unknown[]).includes(card));
const isBooleanList = (value: unknown) => Array.isArray(value) && value.every(up => typeof up === "boolean");
const isName = (value: unknown) => value === null || typeof value === "string";
const isCount = (value: unknown): value is number => typeof value === "number" && Number.isInteger(value) && value >= 0;
const isCountOrNull = (value: unknown) => value === null || isCount(value);

const isSeat = (value: unknown) => isObject(value)
    && isCardList(value.pile) && isCardList(value.played) && isBooleanList(value.playedUp)
    && isCountOrNull(value.rank) && isCountOrNull(value.eliminatedRound);

const isGame = (game: Record<string, unknown>, seatCount: number) =>
    Array.isArray(game.contenders) && game.contenders.every(index => isCount(index) && index < seatCount)
    && (game.step === "up" || game.step === "down")
    && isCount(game.battleCount) && isCount(game.roundNumber) && isCount(game.lastWonCount) && isCount(game.setAsideCount)
    && (game.lastRoundWinner === null || (isCount(game.lastRoundWinner) && game.lastRoundWinner < seatCount))
    && typeof game.hasPlayed === "boolean" && typeof game.isSolo === "boolean"
    && Array.isArray(game.playerNames) && game.playerNames.every(isName);

// a game saved by version 1: the cards on the table and those won go back under the pile of their player
const isOldPlayer = (value: unknown): value is { remainingCards: string[], wonCards: string[], beingPlayedCards: string[] } =>
    isObject(value) && isCardList(value.remainingCards) && isCardList(value.wonCards) && isCardList(value.beingPlayedCards);
const fromVersion1 = (game: Record<string, unknown>): SavedBattleGame | null => {
    const {player1, player2} = game;
    if (!isOldPlayer(player1) || !isOldPlayer(player2) || typeof game.isPlayer2Computer !== "boolean") return null;
    if (!Array.isArray(game.playerNames) || !game.playerNames.every(isName)) return null;
    const seat = (player: typeof player1) => ({
        pile: [...player.beingPlayedCards, ...player.wonCards, ...player.remainingCards] as SavedBattleGame["seats"][number]["pile"],
        played: [], playedUp: [], rank: null, eliminatedRound: null,
    });
    const lastRoundWinner = game.lastRoundWinner === "player1" ? 0 : game.lastRoundWinner === "player2" ? 1 : null;
    return {
        seats: [seat(player1), seat(player2)],
        contenders: [0, 1],
        step: "up",
        battleCount: 0,
        roundNumber: 1,
        lastRoundWinner,
        lastWonCount: 0,
        setAsideCount: 0,
        hasPlayed: game.hasPlayed === true,
        isSolo: game.isPlayer2Computer,
        playerNames: game.playerNames,
        dealSeed: null,
    };
};

// a stored game that does not have this shape is ignored, as if there was none
export const decodeSavedBattleGame = (text: string): SavedBattleGame | null => {
    try {
        const game: unknown = JSON.parse(text);
        if (!isObject(game)) return null;
        if (game.version === undefined) return fromVersion1(game);
        if (game.version !== VERSION || !Array.isArray(game.seats) || game.seats.length < 2 || !game.seats.every(isSeat)) return null;
        if (!isGame(game, game.seats.length)) return null;
        const saved: Record<string, unknown> = {...game};
        delete saved.version;
        // a game saved before the cards collected were shuffled goes on collecting them in seat order
        if (!Number.isInteger(saved.dealSeed)) saved.dealSeed = null;
        return saved as SavedBattleGame;
    } catch {
        return null;
    }
};

export const encodeSavedBattleGame = (game: SavedBattleGame): string => JSON.stringify({version: VERSION, ...game});

// one game for each kind of game
const storageKey = ({players, cardCount}: BattleVariant) => `cardgames.bataille.game.${players}.${cardCount}`;
const variantOfKey = (key: string): BattleVariant | null => {
    const match = /^cardgames\.bataille\.game\.(solo|\d)\.(\d+)$/.exec(key);
    if (!match) return null;
    return {players: match[1] === "solo" ? "solo" : Number(match[1]), cardCount: Number(match[2])};
};

// Stores the games in the browser; without storage (private mode, blocked...) the games are simply not kept
export class LocalStorageBattleSaveAdapter implements BattleSaveService {
    private readonly store = new LocalStorageVariantStore<BattleVariant, SavedBattleGame>({
        name: "Bataille",
        storageKey,
        variantOfKey,
        encode: encodeSavedBattleGame,
        decode: decodeSavedBattleGame,
        // where the single game was kept before
        legacy: {key: "cardgames.bataille.game", variantOf: variantOfSavedGame},
    });

    load = (variant: BattleVariant) => this.store.load(variant);
    savedVariants = () => this.store.savedVariants();
    save = (variant: BattleVariant, game: SavedBattleGame) => this.store.save(variant, game);
    clear = (variant: BattleVariant) => this.store.clear(variant);
}
