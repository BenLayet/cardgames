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
    return <>
        <div className="vstack justify-content-between"
            onClick={() => d.player1Clicked()}>
            <div style={{position: "absolute", bottom: 0, right: 0, zIndex: 1000}}>
                <div ref={deckRef} className="card-stack-container" style={{borderStyle: "none"}}>
                    {v.cardsWithLocation.map(c =>
                        <AnimatedCardView key={c.card} card={c.card} placement={c.placement} layoutState={layoutState}/>)}
                </div>
            </div>
            <div className="d-flex justify-content-end">
                <div ref={player2WonCardsRef} className="card-stack-container"/>
                <div ref={player2RemainingCardsRef} className="card-stack-container"/>
            </div>
            <div className="d-flex">
                <div className="flex-grow-1 d-flex justify-content-end">
                    <div ref={player1BeingPlayedCardsRef} className="card-stack-container"/>
                </div>
                <div className="flex-grow-1">
                    <div ref={player2BeingPlayedCardsRef} className="card-stack-container"/>
                </div>
            </div>
            <div className="d-flex">
                <div ref={player1RemainingCardsRef} className="card-stack-container"/>
                <div ref={player1WonCardsRef} className="card-stack-container"/>
            </div>
        </div>
        {v.hasGameEnded && <div className="end-message-overlay" onClick={() => d.playAgainRequested()}>
            {v.hasPlayer1WonGame && <>
                <Fireworks/>
                <h1>{t("victory")}</h1>
            </>
            }
            {v.hasPlayer2WonGame && <h1>{t("defeat")}</h1>}
            {v.isTiedGame && <h1>{t("tie")}</h1>}
        </div>
        }
    </>
};
