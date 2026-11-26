import {useSofter} from "@softer-components/redux-adapter";

import type {GameContract} from "./game.component.ts";
import {type PointerEvent, useRef} from "react";
import {useMeasure} from "../../../../hooks/useMeasure.ts";
import {AnimatedCardView, type LayoutState} from "../../../card/AnimatedCardView.tsx";
import {Fireworks} from "../../../fireworks/Fireworks.tsx";
import {Tomatoes} from "../../../tomatoes/Tomatoes.tsx";
import {EndMessage} from "../../../end-message/EndMessage.tsx";
import {useTranslation} from "react-i18next";
import {TableActions} from "../../../navigation/TableActions.tsx";

export const View = ({path = ""}) => {
    const [v, d] = useSofter<GameContract>(path);
    const {t} = useTranslation();
    const gameRef = useRef<HTMLDivElement>(null);
    const deckRef = useRef<HTMLDivElement>(null);
    const player1RemainingCardsRef = useRef<HTMLDivElement>(null);
    const player1BeingPlayedCardsRef = useRef<HTMLDivElement>(null);
    const player1WonCardsRef = useRef<HTMLDivElement>(null);
    const player2RemainingCardsRef = useRef<HTMLDivElement>(null);
    const player2BeingPlayedCardsRef = useRef<HTMLDivElement>(null);
    const player2WonCardsRef = useRef<HTMLDivElement>(null);
    // where each stack is drawn, measured once the empty stack containers are laid out
    const layoutState = useMeasure((): LayoutState => ({
        table: deckRef.current?.getBoundingClientRect(),
        stackLocations: {
            deck: deckRef.current?.getBoundingClientRect(),
            player2RemainingCards: player2RemainingCardsRef.current?.getBoundingClientRect(),
            player2BeingPlayedCards: player2BeingPlayedCardsRef.current?.getBoundingClientRect(),
            player2WonCards: player2WonCardsRef.current?.getBoundingClientRect(),
            player1RemainingCards: player1RemainingCardsRef.current?.getBoundingClientRect(),
            player1BeingPlayedCards: player1BeingPlayedCardsRef.current?.getBoundingClientRect(),
            player1WonCards: player1WonCardsRef.current?.getBoundingClientRect(),
        }
    }), [gameRef]);
    // against the computer the whole table plays for player 1,
    // between two humans each one taps their own half: player 2 sits at the top.
    // A pointer down is handled for each finger, so both players can tap at the same time
    // (a click is not fired when two fingers touch the screen together)
    const onTableClicked = (event: PointerEvent<HTMLDivElement>) => {
        const table = event.currentTarget.getBoundingClientRect();
        if (!v.isPlayer2Computer && event.clientY < table.top + table.height / 2) d.player2Clicked();
        else d.player1Clicked();
    };
    const winnerName = v.hasPlayer1WonGame ? v.player1Name : v.player2Name;
    // each half of the table shows whose it is, and how many cards they hold
    const seatName = (name: string | null, number: 1 | 2) => {
        if (name) return name;
        if (v.isPlayer2Computer) return number === 1 ? t("battleStatus.you") : t("computer");
        return t("playerNumber", {number});
    };
    const seatLabel = (name: string | null, number: 1 | 2, count: number) =>
        <div className={`battle-seat battle-seat--player${number}`}>
            <div className="battle-seat-name">{seatName(name, number)}</div>
            <div className="battle-seat-count">{t("cardCountShort", {count})}</div>
        </div>;
    // what to do, then who won the last round
    const status = () => {
        if (v.hasGameEnded) return null;
        if (v.battleCount > 0) return t("battleStatus.battle");
        if (!v.hasPlayed) return v.isPlayer2Computer ? t("battleStatus.tapYourPile") : t("battleStatus.tapYourPiles");
        if (v.lastRoundWinner === null) return null;
        const winnerNumber = v.lastRoundWinner === "player1" ? 1 : 2;
        const typedName = winnerNumber === 1 ? v.player1Name : v.player2Name;
        if (!typedName && v.isPlayer2Computer) return winnerNumber === 1 ? t("battleStatus.youWonRound") : t("battleStatus.computerWonRound");
        return t("battleStatus.playerWonRound", {name: seatName(typedName, winnerNumber)});
    };
    return <>
        <div ref={gameRef} className="battle-table vstack justify-content-between" onPointerDown={onTableClicked}>
            <div style={{position: "absolute", bottom: 0, right: 0, zIndex: 1000}}>
                <div ref={deckRef} className="card-stack-container" style={{borderStyle: "none"}}>
                    {layoutState && v.cardsWithLocation.map(c =>
                        <AnimatedCardView key={c.card} card={c.card} placement={c.placement} layoutState={layoutState}/>)}
                </div>
            </div>
            <div className="d-flex justify-content-end align-items-start">
                {seatLabel(v.player2Name, 2, v.player2CardCount)}
                <div ref={player2WonCardsRef} className="card-stack-container"/>
                <div ref={player2RemainingCardsRef} className="card-stack-container"/>
            </div>
            <div className="d-flex position-relative">
                {v.battleCount > 0 &&
                    <div key={v.battleCount} className="battle-message">
                        {t("battle")}{v.battleCount > 1 && ` x${v.battleCount}`}
                    </div>}
                <div className="flex-grow-1 d-flex justify-content-end">
                    <div ref={player1BeingPlayedCardsRef} className="card-stack-container"/>
                </div>
                <div className="flex-grow-1">
                    <div ref={player2BeingPlayedCardsRef} className="card-stack-container"/>
                </div>
            </div>
            <div className="d-flex align-items-end">
                <div ref={player1RemainingCardsRef} className="card-stack-container"/>
                <div ref={player1WonCardsRef} className="card-stack-container"/>
                {seatLabel(v.player1Name, 1, v.player1CardCount)}
            </div>
        </div>
        <TableActions status={status()}/>
        {v.hasGameEnded && <EndMessage onPlayAgain={() => d.playAgainRequested()} onMenu={() => d.menuRequested()}>
            {v.isPlayer2Computer && v.hasPlayer1WonGame && <>
                <Fireworks/>
                <h2>{t("victory")}</h2>
            </>
            }
            {v.isPlayer2Computer && v.hasPlayer2WonGame && <>
                <h2>{t("defeat")}</h2>
                <Tomatoes/>
            </>
            }
            {!v.isPlayer2Computer && (v.hasPlayer1WonGame || v.hasPlayer2WonGame) && <>
                <Fireworks/>
                <h2>{winnerName ? t("namedPlayerWins", {name: winnerName}) : t("playerWins", {number: v.hasPlayer1WonGame ? 1 : 2})}</h2>
            </>
            }
            {v.isTiedGame && <h2>{t("tie")}</h2>}
        </EndMessage>
        }
    </>
};
