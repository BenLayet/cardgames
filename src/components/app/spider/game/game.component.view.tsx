import {useSofter} from "@softer-components/redux-adapter";
import {useTranslation} from "react-i18next";
import {type CSSProperties, useRef} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faLightbulb, faRotateLeft} from "@fortawesome/free-solid-svg-icons";

import type {GameContract} from "./game.component.ts";
import {CardView} from "../../../card/CardView.tsx";
import {CompactCardView} from "../../../card/CompactCardView.tsx";
import {useMeasure} from "../../../../hooks/useMeasure.ts";
import {useCardFlight} from "../../../../hooks/useCardFlight.ts";
import {cardOffsets} from "./game.component.layout.ts";
import {AppBar} from "../../../navigation/AppBar.tsx";
import {TableActions} from "../../../navigation/TableActions.tsx";
import {Fireworks} from "../../../fireworks/Fireworks.tsx";
import {EndMessage} from "../../../end-message/EndMessage.tsx";
import {spiderRank} from "../../../../model/spider.model.ts";
import {useCardPointer} from "./useCardPointer.ts";

// narrower cards are drawn with text only, the pictures would be unreadable
const COMPACT_CARD_MAX_WIDTH_PX = 60;
// columns always have room for this many card heights, even on a short screen
const MIN_COLUMN_ROOM = 2;
// space kept free below the columns
const BOTTOM_MARGIN_PX = 8;

// the columns stop above the status line and the actions of the game, when these lie below them
const bottomLimit = (columns: DOMRect, below: (Element | null)[]) => Math.min(window.innerHeight, ...below.map(element => {
    const rect = element?.getBoundingClientRect();
    return rect && rect.height > 0 && rect.left < columns.right && rect.right > columns.left ? rect.top : window.innerHeight;
}));

// a dragged card follows the pointer, it does not fly
const isDraggedElement = (element: HTMLElement) => element.classList.contains("spider-card--dragged");

export const View = ({path = "", onBack}: { path?: string, onBack: () => void }) => {
    const [v, d] = useSofter<GameContract>(path);
    const {t} = useTranslation();
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
        const cardHeight = card.width * 200 / 143;
        return {
            compact: card.width < COMPACT_CARD_MAX_WIDTH_PX,
            // in card heights, below the top of the first card of a column
            room: Math.max(MIN_COLUMN_ROOM, (bottomLimit(columns, [statusRef.current, actionsRef.current]) - columns.top - BOTTOM_MARGIN_PX) / cardHeight - 1),
        };
    }, [columnsRef]);
    const compact = measured?.compact ?? false;
    // the cards fly to where they go, and the dealt cards come from the stock
    const tableRef = useRef<HTMLDivElement>(null);
    const stockRef = useRef<HTMLButtonElement>(null);
    const slotsRef = useRef<HTMLDivElement>(null);
    const isCollecting = useCardFlight(tableRef, stockRef, {count: v.completed.length, slots: slotsRef}, isDraggedElement);
    const Face = compact ? CompactCardView : CardView;

    const isSelected = (column: number, index: number) =>
        v.selected !== null && v.selected.column === column && index >= v.selected.index;
    const hintedMove = v.hint?.kind === "move" ? v.hint.move : null;
    const isHinted = (column: number, index: number) =>
        hintedMove !== null && hintedMove.from.column === column && index >= hintedMove.from.index;
    const isHintedTarget = (column: number) => hintedMove?.to === column;

    return <div ref={tableRef} className="spider-table vstack gap-3" style={{"--spider-columns": v.columns.length} as CSSProperties}>
        <AppBar title={t("games.spider")} level={2} onBack={onBack}/>
        <div className="spider-top-bar d-flex justify-content-between align-items-start gap-2">
            <div ref={slotsRef} className="spider-completed" aria-label={t("completedSequences", {count: v.completed.length})}>
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
             {...pointer.handlers}>
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
                        const dragged = pointer.isDragged(columnIndex, index);
                        const classes = [
                            "spider-card",
                            index >= v.movableRunStarts[columnIndex] ? "spider-card--movable" : "",
                            card.faceUp && index < v.movableRunStarts[columnIndex] ? "spider-card--stuck" : "",
                            isSelected(columnIndex, index) ? "spider-card--selected" : "",
                            dragged ? "spider-card--dragged" : "",
                            isHinted(columnIndex, index) ? "spider-card--hint" : "",
                        ].join(" ");
                        return <div key={card.id} data-index={index} data-card-id={card.id} data-rank={spiderRank(card.card)} className={classes}
                                    style={{
                                        top: `calc(var(--spider-card-h) * ${offsets[index]})`,
                                        transform: dragged ? `translate(${pointer.dragOffset.dx}px, ${pointer.dragOffset.dy}px)` : undefined,
                                    }}>
                            <Face card={card.card} faceUp={card.faceUp}/>
                        </div>;
                    })}
                </div>;
            })}
        </div>
        {/* the victory shows once the last sequence has reached its place */}
        {v.hasGameEnded && !isCollecting && <EndMessage onPlayAgain={() => d.playAgainRequested()}>
            <Fireworks/>
            <h1>{t("victory")}</h1>
            <p className="fs-4">{t("moves", {count: v.moveCount})}</p>
        </EndMessage>}
        <TableActions statusRef={statusRef} actionsRef={actionsRef} status={<>
            {v.selected !== null && <span>{t("chooseDestination")}</span>}
            {v.hint?.kind === "none" && <span className="fst-italic">{t("noUsefulMove")}</span>}
            {v.hint?.kind === "emptyColumn" && <span className="fst-italic">{t("useEmptyColumn")}</span>}
            {v.selected === null && v.hint?.kind !== "none" && v.hint?.kind !== "emptyColumn" &&
                <span className="text-nowrap">{t("moves", {count: v.moveCount})}</span>}
        </>}>
            <button className="btn table-action" disabled={v.hasGameEnded}
                    onClick={() => d.hintRequested()}>
                <FontAwesomeIcon icon={faLightbulb}/>
                <span>{t("hint")}</span>
            </button>
            <button className="btn table-action" disabled={!v.canUndo}
                    onClick={() => d.undoRequested()}>
                <FontAwesomeIcon icon={faRotateLeft}/>
                <span>{t("undo")}</span>
            </button>
        </TableActions>
    </div>;
};
