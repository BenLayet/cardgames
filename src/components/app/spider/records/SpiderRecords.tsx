import {useState} from "react";
import {useTranslation} from "react-i18next";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faTrashCan, faTrophy} from "@fortawesome/free-solid-svg-icons";

import {Modal} from "../../../modal/Modal.tsx";
import {formatDuration, type RecordMeasure, type SpiderWin, topWins} from "../../../../model/spider-records.model.ts";
import {CARD_COUNT_OPTIONS, SUIT_COUNT_OPTIONS, suitCountOptionsFor, type SpiderVariant} from "../../../../model/spider.model.ts";

// a short date, with the year only when it is not this one
const useWinDate = () => {
    const {i18n} = useTranslation();
    return (wonAt: number) => {
        const date = new Date(wonAt);
        const year = date.getFullYear() === new Date().getFullYear() ? undefined : "numeric";
        return date.toLocaleDateString(i18n.language, {day: "numeric", month: "short", year});
    };
};

// The best won games of each kind, in a window: choose the kind, see its best games, clear everything
const RecordsWindow = ({wins, variant, latest, onClear, onClose}: {
    wins: SpiderWin[], variant: SpiderVariant, latest: SpiderWin | null, onClear: () => void, onClose: () => void,
}) => {
    const {t} = useTranslation();
    const winDate = useWinDate();
    // it opens on the kind of the game in progress, or the one chosen on the menu
    const [shown, setShown] = useState(variant);
    const [measure, setMeasure] = useState<RecordMeasure>("moves");
    const [isClearAsked, setClearAsked] = useState(false);
    const chooseCardCount = (cardCount: number) => {
        const suitCounts = suitCountOptionsFor(cardCount);
        setShown({cardCount, suitCount: suitCounts.includes(shown.suitCount) ? shown.suitCount : suitCounts[0]});
    };
    const top = topWins(wins, shown, measure);
    const moves = (win: SpiderWin) => t("moves", {count: win.moveCount});
    const time = (win: SpiderWin) => win.elapsedMs === null ? "" : formatDuration(win.elapsedMs);
    const isLatest = (win: SpiderWin) => latest !== null && latest.wonAt === win.wonAt;
    return <Modal title={t("records.title")} onClose={onClose}>
        <div className="records-filters">
            <div className="choice-group" role="group" aria-label={t("cardCount")}>
                {CARD_COUNT_OPTIONS.map(cardCount => <button key={cardCount} className="btn btn-choice"
                                                             aria-pressed={shown.cardCount === cardCount}
                                                             onClick={() => chooseCardCount(cardCount)}>
                    {t("records.cardCount", {count: cardCount})}
                </button>)}
            </div>
            <div className="choice-group" role="group" aria-label={t("suitCount")}>
                {SUIT_COUNT_OPTIONS.map(suitCount => <button key={suitCount} className="btn btn-choice"
                                                             aria-pressed={shown.suitCount === suitCount}
                                                             disabled={!suitCountOptionsFor(shown.cardCount).includes(suitCount)}
                                                             onClick={() => setShown({...shown, suitCount})}>
                    {t("suitCountOption", {count: suitCount})}
                </button>)}
            </div>
            <div className="choice-group" role="group" aria-label={t("records.measure")}>
                <button className="btn btn-choice" aria-pressed={measure === "moves"} onClick={() => setMeasure("moves")}>
                    {t("records.byMoves")}
                </button>
                <button className="btn btn-choice" aria-pressed={measure === "time"} onClick={() => setMeasure("time")}>
                    {t("records.byTime")}
                </button>
            </div>
        </div>
        {top.length === 0
            ? <p className="records-empty">{t("records.none")}</p>
            : <ol className="records-list">
                {top.map((win, index) => <li key={win.wonAt} className={isLatest(win) ? "records-latest" : undefined}>
                    <span className="records-rank">{index + 1}</span>
                    <span className="records-main">{measure === "moves" ? moves(win) : time(win)}</span>
                    <span className="records-other">{measure === "moves" ? time(win) : moves(win)}</span>
                    <span className="records-date">{winDate(win.wonAt)}</span>
                </li>)}
            </ol>}
        {isClearAsked
            ? <div className="records-clear" role="alertdialog" aria-label={t("records.clearQuestion")}>
                <p><strong>{t("records.clearQuestion")}</strong> {t("records.clearWarning")}</p>
                <div className="records-clear-actions">
                    <button className="btn btn-primary" onClick={() => {
                        onClear();
                        setClearAsked(false);
                    }}>{t("records.clear")}</button>
                    <button className="btn btn-outline-primary" onClick={() => setClearAsked(false)}>{t("records.cancel")}</button>
                </div>
            </div>
            : <button className="btn btn-outline-primary records-reset" disabled={wins.length === 0}
                      onClick={() => setClearAsked(true)}>
                <FontAwesomeIcon icon={faTrashCan}/> {t("records.reset")}
            </button>}
    </Modal>;
};

// The button of the top bar that opens the records
export const SpiderRecords = ({wins, variant, latest, onClear}: {
    wins: SpiderWin[], variant: SpiderVariant, latest: SpiderWin | null, onClear: () => void,
}) => {
    const {t} = useTranslation();
    // only a window over the screen, nothing else depends on it
    const [isOpen, setOpen] = useState(false);
    return <>
        <button className="btn app-bar-button" title={t("records.title")} aria-label={t("records.title")}
                aria-haspopup="dialog" onClick={() => setOpen(true)}>
            <FontAwesomeIcon icon={faTrophy}/>
        </button>
        {isOpen && <RecordsWindow wins={wins} variant={variant} latest={latest} onClear={onClear} onClose={() => setOpen(false)}/>}
    </>;
};
