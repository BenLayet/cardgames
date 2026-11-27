import {useSofter} from "@softer-components/redux-adapter";
import {type CSSProperties, type KeyboardEvent, type PointerEvent, useEffect, useEffectEvent, useMemo, useRef} from "react";
import {useTranslation} from "react-i18next";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faRobot} from "@fortawesome/free-solid-svg-icons";

import type {GameContract} from "./game.component.ts";
import {useMeasure} from "../../../../hooks/useMeasure.ts";
import {AnimatedCardView, type Coordinates, type LayoutState} from "../../../card/AnimatedCardView.tsx";
import {LANDED_MS, RAISE} from "../../../card/card-motion.ts";
import {Sparks, type SparksHandle} from "../../../sparks/Sparks.tsx";
import type {CardPlacement} from "../../../../model/deck.model.ts";
import type {BattleStackLocation} from "./game.component.state.ts";
import {Fireworks} from "../../../fireworks/Fireworks.tsx";
import {Tomatoes} from "../../../tomatoes/Tomatoes.tsx";
import {EndMessage} from "../../../end-message/EndMessage.tsx";
import {TableActions} from "../../../navigation/TableActions.tsx";
import {isCompactWidth} from "../../../card/card-size.ts";
import {landingPoint, nearestSeat, playerKeys, type TableLayout, tableLayout} from "./game.component.layout.ts";
import type {SeatView} from "./game.component.selectors.ts";


// the cards are dealt one after the other, to each player in turn
const DEAL_STAGGER_MS = 20;
const seatOf = (location: BattleStackLocation) => Number(/^seat(\d+)/.exec(location)?.[1] ?? 0);
const dealDelayMs = (seatCount: number) => ({stackLocation, index}: CardPlacement<BattleStackLocation>) =>
    (index * seatCount + seatOf(stackLocation)) * DEAL_STAGGER_MS;
// the sparks for the winner of a round: how many, and how fast in part of the card width per frame
const WIN_SPARKS = {count: 70, speed: 0.045};
const LANDING_SPARKS = {count: 50, speed: 0.04};

export const View = ({path = ""}) => {
    const [v] = useSofter<GameContract>(path);
    // the table is laid out again for another number of players
    return <Table key={v.seatCount} path={path}/>;
};

const Table = ({path}: { path: string }) => {
    const [v, d] = useSofter<GameContract>(path);
    const {t} = useTranslation();
    const tableRef = useRef<HTMLDivElement>(null);
    const size = useMeasure(() => {
        const rect = tableRef.current?.getBoundingClientRect();
        return rect ? {width: rect.width, height: rect.height} : null;
    }, [tableRef]);
    // a slot in the middle for each player still in the game; at the end, for the winners
    const inGame = v.seats.flatMap((seat, index) => seat.rank === null ? [index] : []);
    const seatsInGame = (inGame.length > 0 ? inGame : v.seats.flatMap((seat, index) => seat.rank === 1 ? [index] : [])).join(",");
    const layout: TableLayout | null = useMemo(
        () => size && size.width > 0 && v.seatCount > 0
            ? tableLayout(v.seatCount, size.width, size.height, seatsInGame.split(",").filter(Boolean).map(Number))
            : null,
        [size, v.seatCount, seatsInGame]);
    // the cards are drawn from the top left corner of the table: each stack is where the layout puts it
    const layoutState: LayoutState | null = useMemo(() => {
        if (!layout || !size) return null;
        const corner = ({x, y}: { x: number, y: number }) => ({left: x - layout.cardWidth / 2, top: y - layout.cardHeight / 2});
        const stackLocations: LayoutState["stackLocations"] = {deck: corner({x: size.width / 2, y: size.height / 2})};
        layout.seats.forEach((seat, index) => {
            stackLocations[`seat${index}Pile`] = corner(seat.pile);
            stackLocations[`seat${index}Played`] = corner(seat.played);
        });
        return {table: {left: 0, top: 0}, stackLocations};
    }, [layout, size]);

    // the cards won land against the pile of the winner, on the side of the centre of the table, then go under it
    const winner = v.roundWinner;
    const landing: { centre: { x: number, y: number }, corner: Coordinates } | null = useMemo(() => {
        if (winner === null || !layout || !size) return null;
        const centre = landingPoint(layout, winner, {x: size.width / 2, y: size.height / 2});
        return {centre, corner: {left: centre.x - layout.cardWidth / 2, top: centre.y - layout.cardHeight / 2}};
    }, [winner, layout, size]);

    // sparks, gold and in the colour of the winner: from the winning card, then from the pile when the cards land on it.
    // A game resumed while its cards are being collected shows none.
    const sparks = useRef<SparksHandle>(null);
    const celebratedCard = useRef(v.winningCard);
    useEffect(() => {
        if (v.winningCard === celebratedCard.current) return;
        celebratedCard.current = v.winningCard;
        if (v.winningCard === null || winner === null || !layout) return;
        const {played} = layout.seats[winner];
        sparks.current?.burst({
            x: played.x, y: played.y - layout.cardHeight * RAISE.height, color: `--app-seat-${winner}`,
            count: WIN_SPARKS.count, speed: layout.cardWidth * WIN_SPARKS.speed,
        });
    }, [v.winningCard, winner, layout]);
    const playedCount = v.cardsWithLocation.filter(c => c.placement.stackLocation.endsWith("Played")).length;
    const lastPlayedCount = useRef(playedCount);
    useEffect(() => {
        const collected = playedCount < lastPlayedCount.current;
        lastPlayedCount.current = playedCount;
        if (!collected || landing === null || winner === null || !layout) return;
        const timer = setTimeout(() => sparks.current?.burst({
            x: landing.centre.x, y: landing.centre.y, color: `--app-seat-${winner}`,
            count: LANDING_SPARKS.count, speed: layout.cardWidth * LANDING_SPARKS.speed,
        }), LANDED_MS);
        return () => clearTimeout(timer);
    }, [playedCount, landing, winner, layout]);

    const humanSeats = v.seats.flatMap((seat, index) => !seat.isComputer && seat.rank === null ? [index] : []);
    // against the computer the whole table plays for the player; between humans each one taps near their own pile.
    // A pointer down is handled for each finger, so that several players can tap at the same time
    // (a click is not fired when two fingers touch the screen together)
    const onTableClicked = (event: PointerEvent<HTMLDivElement>) => {
        if (v.isSolo || !layout) {
            d.playerClicked(0);
            return;
        }
        const table = event.currentTarget.getBoundingClientRect();
        const seat = nearestSeat(layout, humanSeats, {x: event.clientX - table.left, y: event.clientY - table.top});
        if (seat !== null) d.playerClicked(seat);
    };
    // with the keyboard: Enter or Space on a pile plays it; between humans, each one also has a key
    const onPileKey = (seat: number) => (event: KeyboardEvent) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        d.playerClicked(seat);
    };
    const onKey = useEffectEvent((event: globalThis.KeyboardEvent) => {
        if (v.hasGameEnded || event.repeat || event.defaultPrevented || event.target instanceof HTMLInputElement) return;
        // once a round is won, Space, Enter or a player's key turns over the hidden cards or collects the top layer
        if ((v.canRevealHiddenCards || v.canCollectCards) && (event.key === " " || event.key === "Enter")) {
            event.preventDefault();
            d.playerClicked(0);
            return;
        }
        if (v.isSolo) return;
        const seat = playerKeys(v.seatCount).indexOf(event.key.toLowerCase());
        if (seat >= 0 && seat < v.seatCount) d.playerClicked(seat);
    });
    useEffect(() => {
        const listener = (event: globalThis.KeyboardEvent) => onKey(event);
        window.addEventListener("keydown", listener);
        return () => window.removeEventListener("keydown", listener);
    }, []);

    const seatName = (index: number) => {
        const seat = v.seats[index];
        if (seat.name) return seat.name;
        if (v.isSolo) return index === 0 ? t("battleStatus.you") : t("computer");
        return t("playerNumber", {number: index + 1});
    };
    const names = (seats: number[]) => seats.map(seatName).join(", ");
    const waiting = v.seats.flatMap((seat, index) => seat.canPlay && !seat.isComputer ? [index] : []);
    // what to do, then who won the last round
    const status = () => {
        if (v.hasGameEnded) return null;
        // the round is won: the players tap to collect the cards layer by layer, turning over the hidden ones first
        if (v.canRevealHiddenCards) return t("battleStatus.tapToReveal");
        if (v.canCollectCards && v.roundWinner !== null) return t("battleStatus.tapToCollect", {won: wonCards(v.roundWinner)});
        if (v.roundWinner !== null) return wonCards(v.roundWinner);
        if (v.battleCount > 0) return v.isSolo || waiting.length === 0
            ? t("battleStatus.battle", {battle: battleName()})
            : t("battleStatus.battleToPlay", {battle: battleName(), names: names(waiting)});
        if (!v.hasPlayed) return v.isSolo ? t("battleStatus.tapYourPile") : t("battleStatus.tapYourPiles");
        if (!v.isSolo && v.areCardsOnTable && waiting.length > 0) return t("battleStatus.toPlay", {names: names(waiting)});
        const eliminated = v.seats.flatMap((seat, index) => seat.eliminatedRound === v.roundNumber - 1 ? [index] : []);
        if (!v.areCardsOnTable && eliminated.length > 0 && !v.isSolo) return t("battleStatus.eliminated", {names: names(eliminated), count: eliminated.length});
        const lastRound = v.lastRoundWinner === null ? null : wonCards(v.lastRoundWinner);
        // alone against the computer, the player is told when the game waits for them
        if (v.isSolo && waiting.includes(0)) return lastRound === null ? t("battleStatus.yourTurn") : `${lastRound} · ${t("battleStatus.yourTurn")}`;
        return lastRound;
    };
    // a battle after a battle is a double battle, then a triple one, then "Battle x4", "Battle x5"…
    const battleName = () => t(`battle.${v.battleCount <= 3 ? v.battleCount : "more"}`, {count: v.battleCount});
    const wonCards = (seat: number) => {
        // how many cards are won is not told, to keep some suspense (#165)
        if (v.isSolo && !v.seats[seat].name) return seat === 0 ? t("battleStatus.youWonCards") : t("battleStatus.computerWonCards");
        return t("battleStatus.playerWonCards", {name: seatName(seat)});
    };
    const place = (rank: number) => t("place", {count: rank, ordinal: true});

    const seatClass = (seat: SeatView) => [
        "battle-seat",
        seat.isDimmed && "battle-seat--dimmed",
        seat.isRoundWinner && "battle-seat--winner",
        seat.rank !== null && !v.hasGameEnded && "battle-seat--out",
    ].filter(Boolean).join(" ");

    return <>
        <div ref={tableRef} className="battle-table" onPointerDown={onTableClicked}
             style={layout ? {"--battle-card-w": `${layout.cardWidth}px`} as CSSProperties : undefined}>
            {/* the places of the stacks lie under the cards; what is written about them is drawn with the cards, over them (layers.css) */}
            {layout && v.seats.map((seat, index) => {
                const {pile, played, hasSlot} = layout.seats[index];
                const key = v.isSolo ? null : playerKeys(v.seatCount)[index];
                const isPlayable = !seat.isComputer && seat.rank === null;
                return <div key={index} className={seatClass(seat)} style={{"--seat-color": `var(--app-seat-${index})`} as CSSProperties}>
                    {hasSlot && <div className="battle-played" style={{left: played.x, top: played.y}}/>}
                    <div className="battle-pile" style={{left: pile.x, top: pile.y}}
                         {...(isPlayable ? {
                             tabIndex: 0,
                             role: "button",
                             "aria-label": key ? t("battleStatus.playPileWithKey", {key: key.toUpperCase()}) : t("battleStatus.playPile"),
                             "aria-keyshortcuts": key?.toUpperCase(),
                             title: key ? t("battleStatus.playPileWithKey", {key: key.toUpperCase()}) : undefined,
                             onKeyDown: onPileKey(index),
                         } : {})}/>
                </div>;
            })}
            {/* the message of a battle, just above the cards played: the layout keeps room for it */}
            {v.battleCount > 0 && layout &&
                <div className="battle-message-anchor"
                     style={{left: layout.message.x, top: layout.message.bottom, "--battle-message-size": `${layout.message.fontSize}px`} as CSSProperties}>
                    <div key={v.battleCount} className="battle-message">
                        {battleName()}
                    </div>
                </div>}
            {/* the cards, then what is written about them; a card won flies over both (layers.css) */}
            <div className="battle-cards">
                {layoutState && v.cardsWithLocation.map(c =>
                    <AnimatedCardView key={c.card} card={c.card} placement={c.placement} layoutState={layoutState}
                                      entry={v.isRestored ? "inPlace" : dealDelayMs(v.seatCount)(c.placement)}
                                      compact={layout !== null && isCompactWidth(layout.cardWidth)}
                                      raised={c.card === v.winningCard}
                                      dimmed={v.seats[seatOf(c.placement.stackLocation)]?.isDimmed ?? false}
                                      landing={landing !== null && c.placement.stackLocation === `seat${winner}Pile` ? landing.corner : undefined}/>)}
                {layout && v.seats.map((seat, index) => {
                    const {pile, played, hasSlot, labelSide} = layout.seats[index];
                    const key = v.isSolo ? null : playerKeys(v.seatCount)[index];
                    const isPlayable = !seat.isComputer && seat.rank === null;
                    return <div key={index} className={seatClass(seat)} style={{"--seat-color": `var(--app-seat-${index})`} as CSSProperties}>
                        {hasSlot && <div className="battle-marks battle-marks--played" style={{left: played.x, top: played.y}}/>}
                        <div className={`battle-marks battle-marks--pile battle-marks--label-${labelSide}`} style={{left: pile.x, top: pile.y}}>
                            {key && isPlayable && <span className="battle-keycap" aria-hidden="true">{key.toUpperCase()}</span>}
                            <div className="battle-seat-label">
                                <div className="battle-seat-name">
                                    <i className="battle-seat-dot"/>
                                    {seat.isComputer && <FontAwesomeIcon icon={faRobot} className="battle-seat-bot"/>}
                                    <span>{seatName(index)}</span>
                                </div>
                                {/* no card count under the name, to keep some suspense (#165) */}
                                {seat.rank !== null && !v.hasGameEnded &&
                                    <span className="battle-seat-tag">{t("battleStatus.eliminatedTag", {place: place(seat.rank)})}</span>}
                            </div>
                        </div>
                    </div>;
                })}
            </div>
            <Sparks ref={sparks} className="battle-sparks"/>
        </div>
        <TableActions status={status()}/>
        {v.hasGameEnded && <EndMessage onPlayAgain={() => d.playAgainRequested()} onMenu={() => d.menuRequested()}>
            {v.isSolo && v.gameWinner === 0 && <>
                <Fireworks/>
                <h2>{t("battleEnd.youWon")}</h2>
            </>}
            {v.isSolo && v.gameWinner === 1 && <>
                <h2>{t("battleEnd.computerWon")}</h2>
                <Tomatoes/>
            </>}
            {!v.isSolo && v.gameWinner !== null && <>
                <Fireworks/>
                <h2>{t("battleEnd.playerWon", {name: seatName(v.gameWinner)})}</h2>
            </>}
            {v.isTiedGame && <h2>{t("tie")}</h2>}
            {/* between three humans or more, the place of each player, with the colour of their seat;
                with two, the title already says who won */}
            {!v.isSolo && v.seats.length > 2 && <ol className="battle-ranking">
                {v.ranking.map(index => {
                    const seat = v.seats[index];
                    return <li key={index} className={seat.rank === 1 ? "battle-ranking-first" : undefined}
                               style={{"--seat-color": `var(--app-seat-${index})`} as CSSProperties}>
                        <span className="battle-ranking-place">{seat.rank !== null && place(seat.rank)}</span>
                        <i className="seat-dot" aria-hidden="true"/>
                        <span className="battle-ranking-name">{seatName(index)}</span>
                        {seat.eliminatedRound !== null && seat.rank !== 1 &&
                            <span className="battle-ranking-why">{t("battleEnd.outInRound", {round: seat.eliminatedRound})}</span>}
                    </li>;
                })}
            </ol>}
        </EndMessage>}
    </>;
};
