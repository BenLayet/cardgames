import {useTranslation} from "react-i18next";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCrown, faStopwatch, faTrophy} from "@fortawesome/free-solid-svg-icons";

import {formatDuration, type RecordPeriod, type SpiderWin} from "../../../../model/spider-records.model.ts";

type Rank = { rank: number, period: RecordPeriod } | null;
const isRecord = (rank: Rank) => rank?.rank === 1 && rank.period === "all";

// What the victory says about the won game: its kind, its moves and time, and its place among the best games
// of its kind, over the most important period where it has one
export const SpiderVictory = ({win, moveRank, timeRank, bestMoves, bestTime}: {
    win: SpiderWin, moveRank: Rank, timeRank: Rank, bestMoves: SpiderWin | null, bestTime: SpiderWin | null,
}) => {
    const {t} = useTranslation();
    const moves = (win: SpiderWin) => t("moves", {count: win.moveCount});
    const time = (win: SpiderWin | null) => win?.elapsedMs == null ? null : formatDuration(win.elapsedMs);
    // a new record of all time, of moves, of time, or of both
    const newRecord = isRecord(moveRank) && isRecord(timeRank) ? "newRecord"
        : isRecord(moveRank) ? "newMoveRecord" : isRecord(timeRank) ? "newTimeRecord" : null;
    const best = [bestMoves && moves(bestMoves), time(bestTime)].filter(Boolean).join(" · ");
    const rankLine = (key: "moveRank" | "timeRank", rank: Rank) => rank && !isRecord(rank) &&
        <p className="victory-rank">
            <FontAwesomeIcon icon={key === "moveRank" ? faTrophy : faStopwatch}/>
            {" "}{t(`records.${key}`, {rank: rank.rank, period: t(`records.of.${rank.period}`)})}
        </p>;
    return <>
        <p className="victory-kind">
            {t("records.kind", {cards: t("records.cardCount", {count: win.cardCount}), suits: t("suitCountOption", {count: win.suitCount})})}
        </p>
        <p className="fs-4">{[moves(win), time(win)].filter(Boolean).join(" · ")}</p>
        {newRecord && <p className="victory-record"><FontAwesomeIcon icon={faCrown}/> {t(`records.${newRecord}`)}</p>}
        {rankLine("moveRank", moveRank)}
        {rankLine("timeRank", timeRank)}
        {moveRank === null && timeRank === null && best && <p className="victory-best">{t("records.best", {best})}</p>}
    </>;
};
