import {useSofter} from "@softer-components/redux-adapter";
import {useTranslation} from "react-i18next";
import {type CSSProperties, type PointerEvent, useRef, useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faLightbulb, faRotateLeft} from "@fortawesome/free-solid-svg-icons";

import type {GameContract} from "./game.component.ts";
import {CardView} from "../../../card/CardView.tsx";
import {CompactCardView} from "../../../card/CompactCardView.tsx";
import {useMeasure} from "../../../../hooks/useMeasure.ts";
import {cardOffsets} from "./game.component.layout.ts";
import {Fireworks} from "../../../fireworks/Fireworks.tsx";
import {type CardPosition, SEQUENCE_COUNT} from "../../../../model/spider.model.ts";

// a press that moves less than this is a click, not a drag
const DRAG_THRESHOLD_PX = 8;
// narrower cards are drawn with text only, the pictures would be unreadable
const COMPACT_CARD_MAX_WIDTH_PX = 60;
// columns always have room for this many card heights, even on a short screen
const MIN_COLUMN_ROOM = 2;
// space kept free below the columns
const BOTTOM_MARGIN_PX = 8;

type Press = {
    pointerId: number;
    // the card under the pointer, none for an empty part of a column
    position: CardPosition | null;
    column: number;
    canDrag: boolean;
    startX: number;
    startY: number;
    dx: number;
    dy: number;
    isDragging: boolean;
};

// the column and card under a point of the page, read from the data attributes of the elements
const targetAt = (element: Element | null): { column: number, index: number | null } | null => {
    const columnElement = element?.closest<HTMLElement>("[data-column]");
    if (!columnElement) return null;
    const cardElement = element?.closest<HTMLElement>("[data-index]");
    return {
        column: Number(columnElement.dataset.column),
        index: cardElement ? Number(cardElement.dataset.index) : null,
    };
};

export const View = ({path = ""}) => {
    const [v, d] = useSofter<GameContract>(path);
    const {t} = useTranslation();
    // a drag only moves the cards on screen until they are dropped, so it stays in the view
    const [press, setPress] = useState<Press | null>(null);
    // the size of the cards and the height left below the top of the columns decide how the columns are laid out
    const columnsRef = useRef<HTMLDivElement>(null);
    const measured = useMeasure(() => {
        const columns = columnsRef.current?.getBoundingClientRect();
        const card = columnsRef.current?.firstElementChild?.getBoundingClientRect();
        if (!columns || !card || card.width === 0) return null;
        const cardHeight = card.width * 200 / 143;
        return {
            compact: card.width < COMPACT_CARD_MAX_WIDTH_PX,
            // in card heights, below the top of the first card of a column
            room: Math.max(MIN_COLUMN_ROOM, (window.innerHeight - columns.top - BOTTOM_MARGIN_PX) / cardHeight - 1),
        };
    }, [columnsRef]);
    const compact = measured?.compact ?? false;
    const Face = compact ? CompactCardView : CardView;

    const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
        if (!event.isPrimary || press !== null) return;
        const target = targetAt(event.target as Element);
        if (target === null) return;
        const position = target.index === null ? null : {column: target.column, index: target.index};
        const canDrag = position !== null && position.index >= v.movableRunStarts[position.column];
        if (canDrag) event.currentTarget.setPointerCapture(event.pointerId);
        setPress({
            pointerId: event.pointerId, position, column: target.column, canDrag,
            startX: event.clientX, startY: event.clientY, dx: 0, dy: 0, isDragging: false,
        });
    };
    const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
        if (press?.pointerId !== event.pointerId || !press.canDrag) return;
        const dx = event.clientX - press.startX;
        const dy = event.clientY - press.startY;
        setPress({...press, dx, dy, isDragging: press.isDragging || Math.hypot(dx, dy) > DRAG_THRESHOLD_PX});
    };
    const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
        if (press?.pointerId !== event.pointerId) return;
        setPress(null);
        if (press.isDragging && press.position !== null) {
            // the dragged cards let the pointer through, so the element found is the one below them
            const drop = targetAt(document.elementFromPoint(event.clientX, event.clientY));
            if (drop !== null && drop.column !== press.position.column) d.cardsDropped({from: press.position, to: drop.column});
        } else if (press.position !== null) {
            d.cardClicked(press.position);
        } else {
            d.columnClicked(press.column);
        }
    };

    const isDragged = (column: number, index: number) =>
        press?.isDragging === true && press.position?.column === column && index >= press.position.index;
    const isSelected = (column: number, index: number) =>
        v.selected !== null && v.selected.column === column && index >= v.selected.index;
    const hintedMove = v.hint?.kind === "move" ? v.hint.move : null;
    const isHinted = (column: number, index: number) =>
        hintedMove !== null && hintedMove.from.column === column && index >= hintedMove.from.index;
    const isHintedTarget = (column: number) => hintedMove?.to === column;

    return <div className="spider-table vstack gap-3">
        <div className="spider-top-bar d-flex justify-content-between align-items-start gap-2">
            <div className="spider-completed" aria-label={t("completedSequences", {count: v.completed.length})}>
                {Array.from({length: SEQUENCE_COUNT}, (_, i) => <div key={i} className="spider-slot">
                    {v.completed[i] && <div className="spider-card"><Face card={`K${v.completed[i]}`}/></div>}
                </div>)}
            </div>
            <div className="d-flex align-items-center gap-2 flex-wrap justify-content-end">
                {v.hint?.kind === "none" && <span className="small fst-italic" role="status">{t("noUsefulMove")}</span>}
                {v.hint?.kind === "emptyColumn" && <span className="small fst-italic" role="status">{t("useEmptyColumn")}</span>}
                <span className="text-nowrap">{t("moves", {count: v.moveCount})}</span>
                <button className="btn btn-outline-primary" disabled={v.hasGameEnded}
                        title={t("hint")} aria-label={t("hint")}
                        onClick={() => d.hintRequested()}>
                    <FontAwesomeIcon icon={faLightbulb}/>
                </button>
                <button className="btn btn-outline-primary" disabled={!v.canUndo}
                        title={t("undo")} aria-label={t("undo")}
                        onClick={() => d.undoRequested()}>
                    <FontAwesomeIcon icon={faRotateLeft}/>
                </button>
                <button className={`spider-stock ${v.isDealBlocked ? "spider-stock--blocked" : ""} ${v.hint?.kind === "deal" ? "spider-hint" : ""}`}
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
        </div>
        <div ref={columnsRef} className="spider-columns"
             onPointerDown={onPointerDown}
             onPointerMove={onPointerMove}
             onPointerUp={onPointerUp}
             onPointerCancel={() => setPress(null)}>
            {v.columns.map((column, columnIndex) => {
                const offsets = cardOffsets(column, measured?.room ?? MIN_COLUMN_ROOM, compact);
                const columnClasses = [
                    "spider-column",
                    v.destinations.includes(columnIndex) ? "spider-column--destination" : "",
                    isHintedTarget(columnIndex) ? "spider-column--hint" : "",
                ].join(" ");
                return <div key={columnIndex} data-column={columnIndex} className={columnClasses}
                            style={{"--column-height": offsets[offsets.length - 1] ?? 0} as CSSProperties}>
                    {column.map((card, index) => {
                        const dragged = isDragged(columnIndex, index);
                        const classes = [
                            "spider-card",
                            index >= v.movableRunStarts[columnIndex] ? "spider-card--movable" : "",
                            card.faceUp && index < v.movableRunStarts[columnIndex] ? "spider-card--stuck" : "",
                            isSelected(columnIndex, index) ? "spider-card--selected" : "",
                            dragged ? "spider-card--dragged" : "",
                            isHinted(columnIndex, index) ? "spider-card--hint" : "",
                        ].join(" ");
                        return <div key={card.id} data-index={index} className={classes}
                                    style={{
                                        top: `calc(var(--spider-card-h) * ${offsets[index]})`,
                                        transform: dragged ? `translate(${press?.dx ?? 0}px, ${press?.dy ?? 0}px)` : undefined,
                                    }}>
                            <Face card={card.card} faceUp={card.faceUp}/>
                        </div>;
                    })}
                </div>;
            })}
        </div>
        {v.hasGameEnded && <div className="end-message-overlay" onClick={() => d.playAgainRequested()}>
            <Fireworks/>
            <h1>{t("victory")}</h1>
            <p className="fs-4">{t("moves", {count: v.moveCount})}</p>
        </div>}
    </div>;
};
