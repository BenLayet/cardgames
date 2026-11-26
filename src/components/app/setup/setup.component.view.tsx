import {useSofter} from "@softer-components/redux-adapter";
import {useTranslation} from "react-i18next";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faMinus, faPlay, faPlus, faRobot, faUser} from "@fortawesome/free-solid-svg-icons";

import type {SetupContract} from "./setup.component.ts";
import {AppBar} from "../../navigation/AppBar.tsx";
import {hasRules} from "../../navigation/rules.ts";
import {MAX_NAME_LENGTH} from "./setup.component.state.ts";
import type {OptionHint as OptionHintKey} from "../../../model/games.model.ts";

const SUIT_SYMBOLS = "♠♥♦♣";

// When a game in progress can be resumed, resuming it is the main action and starting a new game the second one
// what an option changes, under its value: a longer game, a harder one...
const OptionHint = ({hint}: { hint: OptionHintKey | null }) => {
    const {t} = useTranslation();
    return hint && <span className="choice-hint">{t(`optionHints.${hint}`)}</span>;
};

export const View = ({path = "", onResume}: { path?: string, onResume?: () => void }) => {
    const [v, d] = useSofter<SetupContract>(path);
    const {t} = useTranslation();
    const suitCountLabel = (count: number, hint: OptionHintKey | null) =>
        [t("suitCountOption", {count}), hint && t(`optionHints.${hint}`)].filter(Boolean).join(", ");
    return (<div className="setup vstack position-relative">
            <AppBar title={t(`games.${v.gameId}`)} level={1} onBack={() => d.backRequested()}
                    rulesOf={hasRules(v.gameId) ? v.gameId : undefined}/>
            <div className="setup-body vstack align-items-center">
                <div className="setup-options d-flex flex-column text-center">
                    {/* a game for one player has nothing to choose about the players */}
                    {v.maxPlayers > 1 && <div>
                        <span className="setup-label">{t("players")}</span>
                        {!v.isPlayerCountFixed && <div className="d-flex gap-3 justify-content-center align-items-center mb-2">
                            <button className="btn btn-outline-primary" disabled={!v.canRemovePlayer}
                                    title={t("removePlayer")} aria-label={t("removePlayer")}
                                    onClick={() => d.removePlayerRequested()}>
                                <FontAwesomeIcon icon={faMinus}/>
                            </button>
                            <span className="fs-4 fw-bold">{v.playerCount}</span>
                            <button className="btn btn-outline-primary" disabled={!v.canAddPlayer}
                                    title={t("addPlayer")} aria-label={t("addPlayer")}
                                    onClick={() => d.addPlayerRequested()}>
                                <FontAwesomeIcon icon={faPlus}/>
                            </button>
                        </div>}
                        <div className="d-flex flex-column gap-2">
                            {v.seats.map((seat, index) => <div key={index}
                                    className="seat d-flex flex-column gap-1">
                                {/* every seat can be named, the computer's too */}
                                <input className="form-control seat-name" type="text"
                                       value={v.playerNames[index]} maxLength={MAX_NAME_LENGTH}
                                       placeholder={seat === "computer" ? t("computer") : t("playerNumber", {number: index + 1})}
                                       aria-label={t("playerName", {number: index + 1})}
                                       autoComplete="off" enterKeyHint="done"
                                       onChange={event => d.renamePlayerRequested({index, name: event.target.value})}/>
                                {/* a seat that cannot change, like the first one, shows nothing about its kind;
                                    the others say in words who plays it, under the name */}
                                {v.changeableSeats[index] && <span className="choice-group seat-kind">
                                    {(["human", "computer"] as const).map(kind => <button
                                        key={kind}
                                        className="btn btn-choice text-nowrap"
                                        aria-pressed={seat === kind}
                                        onClick={() => {
                                            if (seat !== kind) d.toggleSeatRequested(index);
                                        }}>
                                        <FontAwesomeIcon icon={kind === "human" ? faUser : faRobot}/> {t(kind)}
                                    </button>)}
                                </span>}
                            </div>)}
                        </div>
                    </div>}
                    {v.cardCountOptions.length > 0 && <div>
                        <span className="setup-label">{t("cardCount")}</span>
                        <div className="choice-group">
                            {v.cardCountOptions.map((option, index) => <button
                                    key={option}
                                    className="btn btn-choice px-3"
                                    aria-pressed={v.cardCount === option}
                                    onClick={() => d.setCardCountRequested(option)}>
                                    {option}
                                    <OptionHint hint={v.cardCountHints[index]}/>
                                </button>
                            )}
                        </div>
                    </div>}
                    {v.suitCountOptions.length > 0 && <div>
                        <span className="setup-label">{t("suitCount")}</span>
                        <div className="choice-group">
                            {v.suitCountOptions.map((option, index) => <button
                                    key={option}
                                    className="btn btn-choice px-3"
                                    disabled={!v.availableSuitCounts[index]}
                                    aria-pressed={v.suitCount === option}
                                    aria-label={suitCountLabel(option, v.suitCountHints[index])}
                                    title={suitCountLabel(option, v.suitCountHints[index])}
                                    onClick={() => d.setSuitCountRequested(option)}>
                                    {SUIT_SYMBOLS.slice(0, option)}
                                    <OptionHint hint={v.suitCountHints[index]}/>
                                </button>
                            )}
                        </div>
                    </div>}
                </div>
                <div className="setup-actions vstack">
                    {onResume
                        ? <>
                            <button onClick={onResume} className="btn btn-lg btn-primary text-nowrap">
                                <FontAwesomeIcon icon={faPlay}/> {t("resumeGame")}
                            </button>
                            <button onClick={() => d.startGameRequested()} className="btn btn-lg btn-outline-primary">
                                {t("newGame")}
                            </button>
                        </>
                        : <button onClick={() => d.startGameRequested()} className="btn btn-lg btn-primary">
                            {t("start")}
                        </button>}
                </div>
            </div>
        </div>
    );
};
