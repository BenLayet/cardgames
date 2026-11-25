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
};

// The player ranges of the games that are not playable yet are only indicative
export const GAMES: readonly GameDefinition[] = [
    // the current battle engine has exactly two players
    {id: "bataille", minPlayers: 2, maxPlayers: 2, computerOpponents: true, available: true, cardCountOptions: [12, 16, 32, 52], suitCountOptions: []},
    {id: "batailleCorse", minPlayers: 2, maxPlayers: 6, computerOpponents: true, available: false, cardCountOptions: [], suitCountOptions: []},
    {id: "spider", minPlayers: 1, maxPlayers: 1, computerOpponents: false, available: true, cardCountOptions: [104, 52], suitCountOptions: [1, 2, 4]},
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

export const areValidSeats = (game: GameDefinition, seats: unknown): seats is SeatKind[] =>
    Array.isArray(seats)
    && seats.length >= game.minPlayers
    && seats.length <= game.maxPlayers
    && seats[0] === "human"
    && seats.every(s => s === "human" || (s === "computer" && game.computerOpponents));
