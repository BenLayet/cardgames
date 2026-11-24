import {useTranslation} from "react-i18next";

import {GAMES, type GameDefinition, type GameId} from "../../../model/games.model.ts";

const SUITS: Record<GameId, string> = {
    bataille: "♠",
    batailleCorse: "♥",
    spider: "♣",
    crapette: "♦",
    pouilleux: "🃏",
};

const PlayerCount = ({game}: { game: GameDefinition }) => {
    const {t} = useTranslation();
    return game.minPlayers === game.maxPlayers
        ? t("playerCount", {count: game.minPlayers})
        : t("playerRange", {min: game.minPlayers, max: game.maxPlayers});
};

// The list of games: a game that is not playable yet is shown but cannot be chosen
export const Home = ({onGameSelected}: { onGameSelected: (gameId: GameId) => void }) => {
    const {t} = useTranslation();
    return (<div className="vstack align-items-center p-2">
            <h1 className="game-title mt-5">{t("title")}</h1>
            <div className="game-tiles">
                {GAMES.map(game => <button
                    key={game.id}
                    className="btn btn-outline-primary game-tile"
                    disabled={!game.available}
                    onClick={() => onGameSelected(game.id)}>
                    <span className="game-tile-suit" aria-hidden="true">{SUITS[game.id]}</span>
                    <span className="fs-4">{t(`games.${game.id}`)}</span>
                    <span className="badge text-bg-dark"><PlayerCount game={game}/></span>
                    {!game.available && <span className="small fst-italic">{t("comingSoon")}</span>}
                </button>)}
            </div>
        </div>
    );
};
