export type SeatKind = "human" | "computer";

export const GAME_IDS = ["bataille", "batailleCorse", "spider", "crapette", "pouilleux"] as const;
export type GameId = (typeof GAME_IDS)[number];

// What the home page and the setup screen need to know about a game
export type GameDefinition = {
    id: GameId;
    minPlayers: number;
    maxPlayers: number;
    // whether the other seats can be played by the computer
    computerOpponents: boolean;
    // false while the game is not playable yet
    available: boolean;
    // deck sizes offered on the setup screen, none when the game always uses the same deck
    cardCountOptions: number[];
    // numbers of suits offered on the setup screen, none when the game does not let the player choose
    suitCountOptions: number[];
    // the numbers of suits that cannot be chosen with a number of cards
    unavailableSuitCounts?: Partial<Record<number, readonly number[]>>;
    // the players are either one human against the computer ("solo"), or only humans
    soloOrHumans?: boolean;
    // the smallest number of cards dealt to each player: the deck sizes that give fewer cannot be chosen
    minCardsPerPlayer?: number;
    // what each number of cards or of suits changes, shown under it on the setup screen
    cardCountHints?: Partial<Record<number, OptionHint>>;
    suitCountHints?: Partial<Record<number, OptionHint>>;
};
// see "optionHints" in the translations
export type OptionHint = "long" | "medium" | "short" | "easy" | "normal" | "hard";
export const isSuitCountAvailable = (game: GameDefinition, cardCount: number, suitCount: number) =>
    game.suitCountOptions.includes(suitCount) && !(game.unavailableSuitCounts?.[cardCount]?.includes(suitCount) ?? false);

// The player ranges of the games that are not playable yet are only indicative
export const GAMES: readonly GameDefinition[] = [
    {id: "bataille", minPlayers: 2, maxPlayers: 6, computerOpponents: true, soloOrHumans: true, minCardsPerPlayer: 4, available: true, cardCountOptions: [12, 16, 32, 52], suitCountOptions: []},
    {id: "batailleCorse", minPlayers: 2, maxPlayers: 6, computerOpponents: true, available: false, cardCountOptions: [], suitCountOptions: []},
    {id: "spider", minPlayers: 1, maxPlayers: 1, computerOpponents: false, available: true, cardCountOptions: [26, 52, 104], suitCountOptions: [1, 2, 4], unavailableSuitCounts: {26: [4]},
        cardCountHints: {26: "short", 52: "medium", 104: "long"}, suitCountHints: {1: "easy", 2: "normal", 4: "hard"}},
    {id: "crapette", minPlayers: 2, maxPlayers: 2, computerOpponents: true, available: false, cardCountOptions: [], suitCountOptions: []},
    {id: "pouilleux", minPlayers: 2, maxPlayers: 6, computerOpponents: true, available: false, cardCountOptions: [], suitCountOptions: []},
];

export const gameDefinition = (id: GameId): GameDefinition => {
    const game = GAMES.find(g => g.id === id);
    if (game === undefined) throw new Error(`Unknown game: ${id}`);
    return game;
};

// the first seat is always a human, the others are the computer when it can play
export const defaultSeats = (game: GameDefinition, playerCount = game.minPlayers): SeatKind[] =>
    Array.from({length: playerCount}, (_, i) => i > 0 && game.computerOpponents ? "computer" : "human");

// one human against the computer, or only humans
export const soloSeats = (humanCount: number): SeatKind[] =>
    humanCount <= 1 ? ["human", "computer"] : Array.from({length: humanCount}, () => "human");

// whether each player gets enough cards from a deck of this size
export const isCardCountAvailable = (game: GameDefinition, cardCount: number, playerCount: number) =>
    game.cardCountOptions.includes(cardCount) && Math.floor(cardCount / playerCount) >= (game.minCardsPerPlayer ?? 0);

export const areValidSeats = (game: GameDefinition, seats: unknown): seats is SeatKind[] =>
    Array.isArray(seats)
    && (!game.soloOrHumans || seats.every(s => s === "human") || (seats.length === 2 && seats[1] === "computer"))
    && seats.length >= game.minPlayers
    && seats.length <= game.maxPlayers
    && seats[0] === "human"
    && seats.every(s => s === "human" || (s === "computer" && game.computerOpponents));
