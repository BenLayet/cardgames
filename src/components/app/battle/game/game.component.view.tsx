import {useSofter} from "@softer-components/redux-adapter";

import type {GameContract} from "./game.component.ts";
import {useMemo, useRef} from "react";
import {useWindowSize} from "../../../../hooks/useWindowSize.ts";
import {AnimatedCardView, type LayoutState} from "../../../card/AnimatedCardView.tsx";
import {Fireworks} from "../../../fireworks/Fireworks.tsx";
import {useTranslation} from "react-i18next";

export const View = ({path = ""}) => {
    const [v, d] = useSofter<GameContract>(path);
    const {t} = useTranslation();
    const windowSize = useWindowSize();
    const deckRef = useRef<HTMLDivElement>(null);
    const player1RemainingCardsRef = useRef<HTMLDivElement>(null);
    const player1BeingPlayedCardsRef = useRef<HTMLDivElement>(null);
    const player1WonCardsRef = useRef<HTMLDivElement>(null);
    const player2RemainingCardsRef = useRef<HTMLDivElement>(null);
    const player2BeingPlayedCardsRef = useRef<HTMLDivElement>(null);
    const player2WonCardsRef = useRef<HTMLDivElement>(null);
    const layoutState: LayoutState = useMemo(() => {
        return {
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
        };
    }, [windowSize, v.cardsWithLocation]);
    return <div
        style={{cursor: "pointer", width: "100%", height: "100%"}}>
        <div
            onClick={() => d.player1Clicked()}>
            <div style={{position: "absolute", bottom: 0, right: 0, zIndex: 1000}}>
                <div ref={deckRef} className="stack-container" style={{borderStyle: "none"}}>
                    {v.cardsWithLocation.map(c =>
                        <AnimatedCardView key={c.card} card={c.card} location={c.location} layoutState={layoutState}/>)}
                </div>
            </div>
            <div className="d-flex justify-content-end position-relative">
                <div ref={player2WonCardsRef} className="stack-container"/>
                <div ref={player2RemainingCardsRef} className="stack-container"/>
            </div>
            <div className="hstack">
                <div className="hstack flex-grow-1 m-5  justify-content-end">
                    <div ref={player1BeingPlayedCardsRef} className="stack-container"/>
                </div>
                <div className="hstack flex-grow-1 m-5">
                    <div ref={player2BeingPlayedCardsRef} className="stack-container"/>
                </div>
            </div>
            <div className="d-flex justify-content-start position-relative">
                <div ref={player1RemainingCardsRef} className="stack-container"/>
                <div ref={player1WonCardsRef} className="stack-container"/>
            </div>
        </div>
        {v.hasGameEnded && <div className="end-message-overlay" onClick={() => d.playAgainRequested()}>
            {v.hasPlayer1WonGame && <>
                <Fireworks/>
                <h1>{t("victory")}</h1>
            </>
            }
            {v.hasPlayer2WonGame && <h1>{t("defeat")}</h1>}
        </div>
        }
    </div>
};
