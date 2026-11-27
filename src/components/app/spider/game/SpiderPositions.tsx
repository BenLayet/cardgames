import {useTranslation} from "react-i18next";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBookmark, faTrashCan} from "@fortawesome/free-solid-svg-icons";

import {Modal} from "../../../modal/Modal.tsx";
import {MAX_SAVED_POSITIONS, type SavedPosition, type Table} from "../../../../model/spider.model.ts";

// A tiny drawing of a table, to recognise a saved position: each card is a small block, its back or its face,
// too small to be read; it is not a card of the game, so it is not drawn with the card components
const TableThumbnail = ({table}: { table: Table }) => <div className="spider-thumbnail" aria-hidden="true">
    {table.columns.map((column, i) => <div key={i} className="spider-thumbnail-column">
        {column.map(card => <div key={card.id}
                                 className={`spider-thumbnail-card ${card.faceUp ? "spider-thumbnail-card--up" : ""}`}/>)}
    </div>)}
</div>;

// The positions the player saved to go back to them later: save the current one, go back to one, delete one
export const SpiderPositions = ({positions, replaced, onSave, onRestore, onDelete, onClose}: {
    positions: SavedPosition[],
    replaced: SavedPosition | null,
    onSave: () => void,
    onRestore: (index: number) => void,
    onDelete: (index: number) => void,
    onClose: () => void,
}) => {
    const {t, i18n} = useTranslation();
    const time = (savedAt: number) => new Date(savedAt).toLocaleTimeString(i18n.language, {hour: "2-digit", minute: "2-digit"});
    const freeCount = MAX_SAVED_POSITIONS - positions.length;
    return <Modal title={t("positions.title")} placement="sheet" onClose={onClose}>
        {positions.length === 0 && <p className="spider-positions-empty">{t("positions.none")}</p>}
        <ul className="spider-positions">
            {positions.map((position, index) => {
                const name = t("positions.move", {count: position.moveCount});
                return <li key={position.savedAt} className="spider-position">
                    <TableThumbnail table={position.table}/>
                    <div className="spider-position-info">
                        <strong>{name}</strong>
                        <span>{t("positions.savedAt", {time: time(position.savedAt)})}</span>
                    </div>
                    <button className="btn btn-outline-primary" aria-label={t("positions.restoreLabel", {name})}
                            onClick={() => onRestore(index)}>
                        {t("positions.restore")}
                    </button>
                    <button className="btn btn-outline-primary spider-position-delete" title={t("positions.delete")}
                            aria-label={t("positions.deleteLabel", {name})} onClick={() => onDelete(index)}>
                        <FontAwesomeIcon icon={faTrashCan}/>
                    </button>
                </li>;
            })}
            {Array.from({length: freeCount}, (_, i) => <li key={`free-${i}`} className="spider-position spider-position--free">
                {t("positions.free")}
            </li>)}
        </ul>
        <button className="btn btn-primary spider-position-save" onClick={onSave}>
            <FontAwesomeIcon icon={faBookmark}/>
            <span>
                {t("positions.save")}
                {replaced && <small>{t("positions.replaces", {name: t("positions.move", {count: replaced.moveCount})})}</small>}
            </span>
        </button>
        <p className="modal-footnote">{t("positions.note")}</p>
    </Modal>;
};
