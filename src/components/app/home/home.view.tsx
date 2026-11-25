import {useState} from "react";
import {useTranslation} from "react-i18next";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCircleInfo} from "@fortawesome/free-solid-svg-icons";

import type {Card} from "../../../model/deck.model.ts";
import {GAMES, type GameDefinition, type GameId} from "../../../model/games.model.ts";
import {CardView} from "../../card/CardView.tsx";
import {GameBar} from "../../game-bar/GameBar.tsx";
import {About} from "./about.view.tsx";

// a few cards fanned out on each tile, null for a card seen from the back
const FANS: Record<GameId, (Card | null)[]> = {
    bataille: ["KH", "AS"],
    batailleCorse: ["JD", "QC"],
    spider: [null, null, "QS"],
    crapette: ["9H", "8C"],
    pouilleux: ["JS", "JC"],
};

const PlayerCount = ({game}: { game: GameDefinition }) => {
    const {t} = useTranslation();
    return game.minPlayers === game.maxPlayers
        ? t("playerCount", {count: game.minPlayers})
        : t("playerRange", {min: game.minPlayers, max: game.maxPlayers});
};

const Fan = ({cards}: { cards: (Card | null)[] }) => <div className="game-tile-fan" aria-hidden="true">
    {cards.map((card, i) => {
        const angle = (i - (cards.length - 1) / 2) * 12;
        return <div key={i} className="game-tile-fan-card" style={{transform: `translateX(-50%) translateX(${angle * 0.9}px) rotate(${angle}deg)`}}>
            <CardView card={card ?? "AS"} faceUp={card !== null}/>
        </div>;
    })}
</div>;

// The list of the games that can be played
export const Home = ({onGameSelected}: { onGameSelected: (gameId: GameId) => void }) => {
    const {t} = useTranslation();
    // only a window over the page, nothing else depends on it
    const [isAboutOpen, setAboutOpen] = useState(false);
    return (<div className="home vstack align-items-center">
            <GameBar>
                <button className="btn btn-outline-primary" title={t("about.button")} aria-label={t("about.button")}
                        onClick={() => setAboutOpen(true)}>
                    <FontAwesomeIcon icon={faCircleInfo}/>
                </button>
            </GameBar>
            {isAboutOpen && <About onClose={() => setAboutOpen(false)}/>}
            <div className="home-hero">
                <span className="eyebrow">{t("tagline")}</span>
                <h1 className="game-title">{t("title")}</h1>
            </div>
            <div className="game-tiles">
                {GAMES.filter(game => game.available).map(game => <button
                    key={game.id}
                    className="game-tile"
                    onClick={() => onGameSelected(game.id)}>
                    <Fan cards={FANS[game.id]}/>
                    <span className="game-tile-name display-font">{t(`games.${game.id}`)}</span>
                    <span className="game-tile-players"><PlayerCount game={game}/></span>
                </button>)}
            </div>
        </div>
    );
};
