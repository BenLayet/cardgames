import {useSofter} from "@softer-components/redux-adapter";

import type {GameContract} from "./game.component.ts";
import {type KeyboardEvent, type PointerEvent, useEffect, useEffectEvent, useRef} from "react";
import {useMeasure} from "../../../../hooks/useMeasure.ts";
import {AnimatedCardView, type LayoutState} from "../../../card/AnimatedCardView.tsx";
import type {CardPlacement} from "../../../../model/deck.model.ts";
import {Fireworks} from "../../../fireworks/Fireworks.tsx";
import {Tomatoes} from "../../../tomatoes/Tomatoes.tsx";
import {EndMessage} from "../../../end-message/EndMessage.tsx";
import {useTranslation} from "react-i18next";
import {TableActions} from "../../../navigation/TableActions.tsx";

// the keys of the two players sharing a keyboard: one at each end of the middle row
const PLAYER1_KEY = "l";
const PLAYER2_KEY = "a";

// the cards are dealt one after the other, to each player in turn
const DEAL_STAGGER_MS = 20;
const dealDelayMs = ({stackLocation, index}: CardPlacement) =>
    (index * 2 + (stackLocation.startsWith("seat1") ? 1 : 0)) * DEAL_STAGGER_MS;

export const View = ({path = ""}) => {
    const [v, d] = useSofter<GameContract>(path);
    const {t} = useTranslation();
    const gameRef = useRef<HTMLDivElement>(null);
    const deckRef = useRef<HTMLDivElement>(null);
    const player1RemainingCardsRef = useRef<HTMLDivElement>(null);
    const player1BeingPlayedCardsRef = useRef<HTMLDivElement>(null);
    const player2RemainingCardsRef = useRef<HTMLDivElement>(null);
    const player2BeingPlayedCardsRef = useRef<HTMLDivElement>(null);
    // where each stack is drawn, measured once the empty stack containers are laid out
    const layoutState = useMeasure((): LayoutState => ({
        table: deckRef.current?.getBoundingClientRect(),
        stackLocations: {
            deck: deckRef.current?.getBoundingClientRect(),
            seat1Pile: player2RemainingCardsRef.current?.getBoundingClientRect(),
            seat1Played: player2BeingPlayedCardsRef.current?.getBoundingClientRect(),
            seat0Pile: player1RemainingCardsRef.current?.getBoundingClientRect(),
            seat0Played: player1BeingPlayedCardsRef.current?.getBoundingClientRect(),
        }
    }), [gameRef]);
    // against the computer the whole table plays for player 1,
    // between two humans each one taps their own half: player 2 sits at the top.
    // A pointer down is handled for each finger, so both players can tap at the same time
    // (a click is not fired when two fingers touch the screen together)
    const onTableClicked = (event: PointerEvent<HTMLDivElement>) => {
        const table = event.currentTarget.getBoundingClientRect();
        if (!v.isSolo && event.clientY < table.top + table.height / 2) d.playerClicked(1);
        else d.playerClicked(0);
    };
    // with the keyboard: Enter or Space on a pile plays it; between two humans, each one also has a key
    const onPileKey = (play: () => void) => (event: KeyboardEvent) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        play();
    };
    const onKey = useEffectEvent((event: globalThis.KeyboardEvent) => {
        if (v.isSolo || v.hasGameEnded || event.repeat || event.target instanceof HTMLInputElement) return;
        const key = event.key.toLowerCase();
        if (key === PLAYER2_KEY) d.playerClicked(1);
        if (key === PLAYER1_KEY) d.playerClicked(0);
    });
    useEffect(() => {
        const listener = (event: globalThis.KeyboardEvent) => onKey(event);
        window.addEventListener("keydown", listener);
        return () => window.removeEventListener("keydown", listener);
    }, []);
    const pile = (play: () => void, key: string | null) => ({
        tabIndex: 0,
        role: "button",
        "aria-label": key ? t("battleStatus.playPileWithKey", {key: key.toUpperCase()}) : t("battleStatus.playPile"),
        "aria-keyshortcuts": key?.toUpperCase(),
        title: key ? t("battleStatus.playPileWithKey", {key: key.toUpperCase()}) : undefined,
        onKeyDown: onPileKey(play),
    });
    const hasPlayer1WonGame = v.gameWinner === 0;
    const hasPlayer2WonGame = v.gameWinner === 1;
    const winnerName = hasPlayer1WonGame ? v.seats[0].name : v.seats[1]?.name ?? null;
    // each half of the table shows whose it is, and how many cards they hold
    const seatName = (name: string | null, number: 1 | 2) => {
        if (name) return name;
        if (v.isSolo) return number === 1 ? t("battleStatus.you") : t("computer");
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
        if (!v.hasPlayed) return v.isSolo ? t("battleStatus.tapYourPile") : t("battleStatus.tapYourPiles");
        if (v.lastRoundWinner === null) return null;
        const winnerNumber = v.lastRoundWinner === 0 ? 1 : 2;
        const typedName = v.seats[v.lastRoundWinner].name;
        if (!typedName && v.isSolo) return winnerNumber === 1 ? t("battleStatus.youWonRound") : t("battleStatus.computerWonRound");
        return t("battleStatus.playerWonRound", {name: seatName(typedName, winnerNumber)});
    };
    return <>
        <div ref={gameRef} className="battle-table vstack justify-content-between" onPointerDown={onTableClicked}>
            <div style={{position: "absolute", bottom: 0, right: 0, zIndex: 1000}}>
                <div ref={deckRef} className="card-stack-container" style={{borderStyle: "none"}}>
                    {layoutState && v.cardsWithLocation.map(c =>
                        <AnimatedCardView key={c.card} card={c.card} placement={c.placement} layoutState={layoutState}
                                          entry={v.isRestored ? "inPlace" : dealDelayMs(c.placement)}/>)}
                </div>
            </div>
            <div className="battle-row-top d-flex justify-content-end align-items-start">
                {seatLabel(v.seats[1]?.name ?? null, 2, v.seats[1]?.cardCount ?? 0)}
                <div ref={player2RemainingCardsRef} className="card-stack-container battle-pile"
                     {...(v.isSolo ? {} : pile(() => d.playerClicked(1), PLAYER2_KEY))}/>
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
                <div ref={player1RemainingCardsRef} className="card-stack-container battle-pile"
                     {...pile(() => d.playerClicked(0), v.isSolo ? null : PLAYER1_KEY)}/>
                {seatLabel(v.seats[0]?.name ?? null, 1, v.seats[0]?.cardCount ?? 0)}
            </div>
        </div>
        <TableActions status={status()}/>
        {v.hasGameEnded && <EndMessage onPlayAgain={() => d.playAgainRequested()} onMenu={() => d.menuRequested()}>
            {v.isSolo && hasPlayer1WonGame && <>
                <Fireworks/>
                <h2>{t("victory")}</h2>
            </>
            }
            {v.isSolo && hasPlayer2WonGame && <>
                <h2>{t("defeat")}</h2>
                <Tomatoes/>
            </>
            }
            {!v.isSolo && (hasPlayer1WonGame || hasPlayer2WonGame) && <>
                <Fireworks/>
                <h2>{winnerName ? t("namedPlayerWins", {name: winnerName}) : t("playerWins", {number: hasPlayer1WonGame ? 1 : 2})}</h2>
            </>
            }
            {v.isTiedGame && <h2>{t("tie")}</h2>}
        </EndMessage>
        }
    </>
};
