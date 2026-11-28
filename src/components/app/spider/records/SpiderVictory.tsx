import {useTranslation} from "react-i18next";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCrown, faStopwatch, faTrophy} from "@fortawesome/free-solid-svg-icons";

import {formatDuration, type SpiderWin} from "../../../../model/spider-records.model.ts";

// What the victory says about the won game: its kind, its moves and time, and its place among the best games of its kind
export const SpiderVictory = ({win, moveRank, timeRank, bestMoves, bestTime}: {
    win: SpiderWin, moveRank: number | null, timeRank: number | null, bestMoves: SpiderWin | null, bestTime: SpiderWin | null,
}) => {
    const {t} = useTranslation();
    const moves = (win: SpiderWin) => t("moves", {count: win.moveCount});
    const time = (win: SpiderWin | null) => win?.elapsedMs == null ? null : formatDuration(win.elapsedMs);
    // a new record of moves, of time, or of both
    const newRecord = moveRank === 1 && timeRank === 1 ? "newRecord" : moveRank === 1 ? "newMoveRecord" : timeRank === 1 ? "newTimeRecord" : null;
    const best = [bestMoves && moves(bestMoves), time(bestTime)].filter(Boolean).join(" · ");
    return <>
        <p className="victory-kind">
            {t("records.kind", {cards: t("records.cardCount", {count: win.cardCount}), suits: t("suitCountOption", {count: win.suitCount})})}
        </p>
        <p className="fs-4">{[moves(win), time(win)].filter(Boolean).join(" · ")}</p>
        {newRecord && <p className="victory-record"><FontAwesomeIcon icon={faCrown}/> {t(`records.${newRecord}`)}</p>}
        {moveRank !== null && moveRank > 1 && <p className="victory-rank">
            <FontAwesomeIcon icon={faTrophy}/> {t("records.moveRank", {rank: moveRank})}
        </p>}
        {timeRank !== null && timeRank > 1 && <p className="victory-rank">
            <FontAwesomeIcon icon={faStopwatch}/> {t("records.timeRank", {rank: timeRank})}
        </p>}
        {moveRank === null && timeRank === null && best && <p className="victory-best">{t("records.best", {best})}</p>}
    </>;
};
