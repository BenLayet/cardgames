import {useSofter} from "@softer-components/redux-adapter";
import {useTranslation} from "react-i18next";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowLeft, faMinus, faPlus, faRobot, faStar, faUser} from "@fortawesome/free-solid-svg-icons";

import type {SetupContract} from "./setup.component.ts";

export const View = ({path = ""}) => {
    const [v, d] = useSofter<SetupContract>(path);
    const {t} = useTranslation();
    return (<div className="vstack position-relative">
            <div className="m-2 position-absolute top-0 start-0">
                <button className="btn btn-primary" title={t("back")} aria-label={t("back")}
                        onClick={() => d.backRequested()}>
                    <FontAwesomeIcon icon={faArrowLeft}/>
                </button>
            </div>
            <div className="vstack justify-content-around align-items-center">
                <h1 className="game-title mt-5">{t(`games.${v.gameId}`)}</h1>
                <div className="d-flex flex-column gap-3 text-center">
                    <div>
                        <label className="fs-3">{t("players")}</label>
                        {!v.isPlayerCountFixed && <div className="d-flex gap-3 justify-content-center align-items-center mb-2">
                            <button className="btn btn-outline-primary" disabled={!v.canRemovePlayer}
                                    title={t("removePlayer")} aria-label={t("removePlayer")}
                                    onClick={() => d.removePlayerRequested()}>
                                <FontAwesomeIcon icon={faMinus}/>
                            </button>
                            <span className="fs-3">{v.playerCount}</span>
                            <button className="btn btn-outline-primary" disabled={!v.canAddPlayer}
                                    title={t("addPlayer")} aria-label={t("addPlayer")}
                                    onClick={() => d.addPlayerRequested()}>
                                <FontAwesomeIcon icon={faPlus}/>
                            </button>
                        </div>}
                        <div className="d-flex flex-column gap-2">
                            {v.seats.map((seat, index) => <div key={index}
                                    className="d-flex gap-2 justify-content-between align-items-center">
                                <span className="fs-5 text-nowrap">{t("playerNumber", {number: index + 1})}</span>
                                <span className="d-inline-flex gap-2">
                                    {(["human", "computer"] as const).map(kind => <button
                                        key={kind}
                                        className={`btn btn-sm text-nowrap ${seat === kind ? "btn-primary" : "btn-outline-primary"}`}
                                        disabled={seat !== kind && !v.changeableSeats[index]}
                                        aria-pressed={seat === kind}
                                        title={t(kind)}
                                        aria-label={t(kind)}
                                        onClick={() => {
                                            if (seat !== kind) d.toggleSeatRequested(index);
                                        }}>
                                        <FontAwesomeIcon icon={kind === "human" ? faUser : faRobot}/>
                                        {/* the names do not fit next to each other on a phone */}
                                        <span className="d-none d-sm-inline"> {t(kind)}</span>
                                    </button>)}
                                </span>
                            </div>)}
                        </div>
                    </div>
                    {v.cardCountOptions.length > 0 && <div>
                        <label className="fs-3">{t("cardCount")}</label>
                        <div className="d-flex gap-2 justify-content-center flex-wrap">
                            {v.cardCountOptions.map((option) => <button
                                    key={option}
                                    className={`btn ${v.cardCount === option ? "btn-primary" : "btn-outline-primary"}`}
                                    onClick={() => d.setCardCountRequested(option)}>
                                    {option}
                                </button>
                            )}
                        </div>
                    </div>}
                </div>
                <button onClick={() => d.startGameRequested()}
                        className="btn btn-lg btn-primary px-2 mt-1 fs-1">
                    <FontAwesomeIcon icon={faStar}/> {t("start")} <FontAwesomeIcon icon={faStar}/>
                </button>
            </div>
        </div>
    );
};
