import {useSofter} from "@softer-components/redux-adapter";
import {useTranslation} from "react-i18next";
import {type CSSProperties, type KeyboardEvent, useEffect, useEffectEvent, useRef, useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBookmark, faLightbulb, faRotateLeft} from "@fortawesome/free-solid-svg-icons";

import type {GameContract} from "./game.component.ts";
import {CardView} from "../../../card/CardView.tsx";
import {CompactCardView} from "../../../card/CompactCardView.tsx";
import {CARD_RATIO, isCompactWidth} from "../../../card/card-size.ts";
import {useMeasure} from "../../../../hooks/useMeasure.ts";
import {type Celebration, type ScreenPoint, useCardFlight} from "../../../../hooks/useCardFlight.ts";
import {Sparks, type SparksHandle} from "../../../sparks/Sparks.tsx";
import {cardOffsets} from "./game.component.layout.ts";
import {AppBar} from "../../../navigation/AppBar.tsx";
import {TableActions} from "../../../navigation/TableActions.tsx";
import {Fireworks} from "../../../fireworks/Fireworks.tsx";
import {EndMessage} from "../../../end-message/EndMessage.tsx";
import {spiderRank} from "../../../../model/spider.model.ts";
import {useCardPointer} from "./useCardPointer.ts";
import {usePressRepeat} from "../../../../hooks/usePressRepeat.ts";
import {SpiderPositions} from "./SpiderPositions.tsx";

// columns always have room for this many card heights, even on a short screen
const MIN_COLUMN_ROOM = 2;
// space kept free below the columns
const BOTTOM_MARGIN_PX = 8;

// the columns stop above the status line and the actions of the game, when these lie below them
const bottomLimit = (columns: DOMRect, below: (Element | null)[]) => Math.min(window.innerHeight, ...below.map(element => {
    const rect = element?.getBoundingClientRect();
    return rect && rect.height > 0 && rect.left < columns.right && rect.right > columns.left ? rect.top : window.innerHeight;
}));

// holding Undo undoes two moves a second
const UNDO_REPEAT_MS = 500;

// the sparks of a completed sequence, as for the winner of a Bataille round: how many, and how fast in part of the card width
// per frame; from the sequence whole in its column, then from its place when it lands there
const WHOLE_SPARKS = {count: 70, speed: 0.045};
const LANDED_SPARKS = {count: 50, speed: 0.04};
// gold, mixed with the colour of the suit
const suitColor = (suit: string | undefined) => suit === "H" || suit === "D" ? "--app-ruby" : "--app-ink";

// a dragged card follows the pointer, it does not fly
const isDraggedElement = (element: HTMLElement) => element.classList.contains("spider-card--dragged");

export const View = ({path = "", onBack}: { path?: string, onBack: () => void }) => {
    const [v, d] = useSofter<GameContract>(path);
    const {t} = useTranslation();
    const undoPress = usePressRepeat(() => d.undoRequested(), v.canUndo, UNDO_REPEAT_MS);
    const [arePositionsOpen, setPositionsOpen] = useState(false);
    const pointer = useCardPointer(v.movableRunStarts, outcome => {
        if (outcome.kind === "cardClicked") d.cardClicked(outcome.position);
        if (outcome.kind === "columnClicked") d.columnClicked(outcome.column);
        if (outcome.kind === "cardsDropped") d.cardsDropped(outcome.move);
    });
    // the size of the cards and the height left below the top of the columns decide how the columns are laid out
    const columnsRef = useRef<HTMLDivElement>(null);
    const statusRef = useRef<HTMLDivElement>(null);
    const actionsRef = useRef<HTMLDivElement>(null);
    const measured = useMeasure(() => {
        const columns = columnsRef.current?.getBoundingClientRect();
        const card = columnsRef.current?.firstElementChild?.getBoundingClientRect();
        if (!columns || !card || card.width === 0) return null;
        const cardHeight = card.width * CARD_RATIO;
        return {
            compact: isCompactWidth(card.width),
            cardHeight,
            // in card heights, below the top of the first card of a column
            room: Math.max(MIN_COLUMN_ROOM, (bottomLimit(columns, [statusRef.current, actionsRef.current]) - columns.top - BOTTOM_MARGIN_PX) / cardHeight - 1),
        };
    }, [columnsRef]);
    const compact = measured?.compact ?? false;
    // the cards fly to where they go, and the dealt cards come from the stock
    const tableRef = useRef<HTMLDivElement>(null);
    const stockRef = useRef<HTMLButtonElement>(null);
    const slotsRef = useRef<HTMLDivElement>(null);
    const sparks = useRef<SparksHandle>(null);
    const celebrate = (at: ScreenPoint, sequence: number, moment: Celebration) => {
        const cardWidth = (measured?.cardHeight ?? 0) / CARD_RATIO;
        const {count, speed} = moment === "landed" ? LANDED_SPARKS : WHOLE_SPARKS;
        sparks.current?.burst({...at, color: suitColor(v.completed[sequence]), count, speed: cardWidth * speed});
    };
    const isCollecting = useCardFlight(tableRef, stockRef, {count: v.completed.length, slots: slotsRef, celebrate}, isDraggedElement);
    const Face = compact ? CompactCardView : CardView;
    // the victory shows once the last sequence has reached its place
    const isVictoryShown = v.hasGameEnded && !isCollecting;
    const onVictoryShown = useEffectEvent(() => d.victoryShown());
    useEffect(() => {
        if (isVictoryShown) onVictoryShown();
    }, [isVictoryShown]);

    // the keyboard plays like a tap: Enter or Space on a card or an empty column, Escape puts the raised cards down
    const onPress = (action: () => void) => (event: KeyboardEvent) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        event.stopPropagation();
        action();
    };
    const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape" && v.selected !== null) d.columnClicked(v.selected.column);
    };
    // a card played with the keyboard keeps the focus where it goes, or the focus goes to the first card that can move
    const focusedCardId = useRef<number | null>(null);
    useEffect(() => {
        const id = focusedCardId.current;
        if (id === null || !columnsRef.current) return;
        if (columnsRef.current.contains(document.activeElement)) return;
        const card = columnsRef.current.querySelector<HTMLElement>(`[data-card-id="${id}"][tabindex]`)
            ?? columnsRef.current.querySelector<HTMLElement>("[tabindex]");
        card?.focus();
    }, [v.columns]);

    const onCardKey = (event: KeyboardEvent, cardId: number, position: { column: number, index: number }) => onPress(() => {
        focusedCardId.current = cardId;
        d.cardClicked(position);
    })(event);

    const isSelected = (column: number, index: number) =>
        v.selected !== null && v.selected.column === column && index >= v.selected.index;

    return <div ref={tableRef} className="spider-table vstack gap-3" style={{"--spider-columns": v.columns.length} as CSSProperties}>
        <AppBar title={t("games.spider")} level={2} onBack={onBack} rulesOf="spider"/>
        <div className="spider-top-bar d-flex justify-content-between align-items-start gap-2">
            <div ref={slotsRef} className="spider-completed" role="group" aria-label={t("completedSequences", {count: v.completed.length})}>
                {Array.from({length: v.sequenceCount}, (_, i) => <div key={i} className="spider-slot">
                    {v.completed[i] && <div className="spider-card"><Face card={`K${v.completed[i]}`}/></div>}
                </div>)}
            </div>
                <button ref={stockRef} className={`spider-stock ${v.isDealBlocked ? "spider-stock--blocked" : ""} ${v.hint?.kind === "deal" ? "spider-hint" : ""}`}
                        disabled={!v.canDealRow}
                        title={v.isDealBlocked ? t("dealBlocked") : t("dealRow", {count: v.stockRowCount})}
                        aria-label={v.isDealBlocked ? t("dealBlocked") : t("dealRow", {count: v.stockRowCount})}
                        onClick={() => d.stockClicked()}>
                    {Array.from({length: v.stockRowCount}, (_, i) =>
                        <div key={i} className="spider-card spider-stock-card" style={{left: `${i * 6}px`}}>
                            <Face faceUp={false}/>
                        </div>)}
                </button>
        </div>
        <div ref={columnsRef} className="spider-columns"
             {...pointer.handlers} onKeyDown={onKeyDown}>
            {v.columns.map((column, columnIndex) => {
                const offsets = cardOffsets(column, measured?.room ?? MIN_COLUMN_ROOM, compact, measured?.cardHeight);
                const columnClasses = [
                    "spider-column",
                    v.destinations.includes(columnIndex) ? "spider-column--destination" : "",
                ].join(" ");
                // an empty column where the raised cards can go takes the focus, a column with cards is reached by its cards
                const isFocusableColumn = column.length === 0 && v.destinations.includes(columnIndex);
                return <div key={columnIndex} data-column={columnIndex} className={columnClasses}
                            style={{"--column-height": offsets[offsets.length - 1] ?? 0} as CSSProperties}
                            {...(isFocusableColumn ? {
                                tabIndex: 0, role: "button", "aria-label": t("emptyColumn", {number: columnIndex + 1}),
                                onKeyDown: onPress(() => d.columnClicked(columnIndex)),
                            } : {})}>
                    {column.map((card, index) => {
                        const dragged = pointer.isDragged(columnIndex, index);
                        const isMovable = index >= v.movableRunStarts[columnIndex];
                        const classes = [
                            "spider-card",
                            isMovable ? "spider-card--movable" : "",
                            card.faceUp && index < v.movableRunStarts[columnIndex] ? "spider-card--stuck" : "",
                            isSelected(columnIndex, index) ? "spider-card--selected" : "",
                            v.selected?.column === columnIndex && v.selected.index === index ? "spider-card--selected-first" : "",
                            dragged ? "spider-card--dragged" : "",
                        ].join(" ");
                        return <div key={card.id} data-index={index} data-card-id={card.id} data-rank={spiderRank(card.card)} className={classes}
                                    style={{
                                        top: `calc(var(--spider-card-h) * ${offsets[index]})`,
                                        // how far the selected run reaches below its first card, for its shadow
                                        "--selected-run-height": (offsets[offsets.length - 1] ?? 0) - offsets[index],
                                        transform: dragged ? `translate(${pointer.dragOffset.dx}px, ${pointer.dragOffset.dy}px)` : undefined,
                                    } as CSSProperties}
                                    {...(isMovable ? {
                                        tabIndex: 0, role: "button", "aria-pressed": isSelected(columnIndex, index),
                                        onKeyDown: (event: KeyboardEvent) => onCardKey(event, card.id, {column: columnIndex, index}),
                                    } : {})}>
                            <Face card={card.card} faceUp={card.faceUp}/>
                        </div>;
                    })}
                </div>;
            })}
        </div>
        {/* over the whole screen, so that its points are those of the screen; over the cards flying to their place */}
        <div className="spider-sparks"><Sparks ref={sparks}/></div>
        {isVictoryShown && <EndMessage onPlayAgain={() => d.playAgainRequested()} onMenu={() => d.menuRequested()}>
            <Fireworks/>
            <h2>{t("victory")}</h2>
            <p className="fs-4">{t("moves", {count: v.moveCount})}</p>
        </EndMessage>}
        <TableActions statusRef={statusRef} actionsRef={actionsRef} status={<>
            {/* the hint names no destination: every possible one is shown, the solver cannot tell the best one for sure */}
            {v.hint?.kind === "move" && <span>{t("hintMove")}</span>}
            {v.selected !== null && v.hint?.kind !== "move" && <span>{t("chooseDestination")}</span>}
            {v.hint?.kind === "none" && <span className="fst-italic">{t("noUsefulMove")}</span>}
            {v.hint?.kind === "emptyColumn" && <span className="fst-italic">{t("useEmptyColumn")}</span>}
            {v.selected === null && v.hint?.kind !== "none" && v.hint?.kind !== "emptyColumn" &&
                <span className="text-nowrap">{t("moves", {count: v.moveCount})}</span>}
        </>}>
            {/* from the least used to the most used, Undo in the corner (CLAUDE.md §5) */}
            <button className="btn table-action" disabled={v.hasGameEnded} aria-haspopup="dialog"
                    onClick={() => setPositionsOpen(true)}>
                <FontAwesomeIcon icon={faBookmark}/>
                <span>{t("positions.button")}</span>
            </button>
            <button className="btn table-action" disabled={v.hasGameEnded}
                    onClick={() => d.hintRequested()}>
                <FontAwesomeIcon icon={faLightbulb}/>
                <span>{t("hint")}</span>
            </button>
            <button className="btn table-action table-action--repeat" disabled={!v.canUndo} {...undoPress}>
                <FontAwesomeIcon icon={faRotateLeft}/>
                <span>{t("undo")}</span>
            </button>
        </TableActions>
        {arePositionsOpen && <SpiderPositions positions={v.positions} replaced={v.replacedPosition}
                                              onSave={() => d.positionSaveRequested(Date.now())}
                                              onRestore={index => {
                                                  setPositionsOpen(false);
                                                  d.positionRestoreRequested(index);
                                              }}
                                              onDelete={index => d.positionDeleted(index)}
                                              onClose={() => setPositionsOpen(false)}/>}
    </div>;
};
