import {useTranslation} from "react-i18next";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCrown, faTrophy} from "@fortawesome/free-solid-svg-icons";

import type {SpiderWin} from "../../../../model/spider-records.model.ts";

// What the victory says about the won game: its kind, its moves, and its place among the best games of its kind
export const SpiderVictory = ({win, moveRank, best}: {
    win: SpiderWin, moveRank: number | null, best: SpiderWin | null,
}) => {
    const {t} = useTranslation();
    return <>
        <p className="victory-kind">
            {t("records.kind", {cards: t("records.cardCount", {count: win.cardCount}), suits: t("suitCountOption", {count: win.suitCount})})}
        </p>
        <p className="fs-4">{t("moves", {count: win.moveCount})}</p>
        {moveRank === 1 && <p className="victory-record"><FontAwesomeIcon icon={faCrown}/> {t("records.newMoveRecord")}</p>}
        {moveRank !== null && moveRank > 1 && <p className="victory-rank">
            <FontAwesomeIcon icon={faTrophy}/> {t("records.moveRank", {rank: moveRank})}
        </p>}
        {moveRank === null && best !== null && <p className="victory-best">{t("records.best", {moves: t("moves", {count: best.moveCount})})}</p>}
    </>;
};
