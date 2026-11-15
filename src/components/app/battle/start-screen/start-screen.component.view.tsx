import {useSofter} from "@softer-components/redux-adapter";

import type {StartScreenContract} from "./start-screen.component.ts";
import {useTranslation} from "react-i18next";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faGear, faMusic, faStar, faVolumeHigh, faVolumeXmark, faXmark} from "@fortawesome/free-solid-svg-icons";
import {LanguageSwitcher} from "../../../language-switcher";

export const View = ({path = ""}) => {
    const [v, d] = useSofter<StartScreenContract>(path);
    const {t} = useTranslation();
    return (<div className="vstack justify-content-around align-items-center">
            <div className="settings-menu">
                <button
                    className="btn btn-primary"
                    title={t("settings")}
                    aria-label={t("settings")}
                    aria-expanded={v.isSettingsMenuOpen}
                    onClick={() => d.toggleSettingsMenuRequested()}>
                    <FontAwesomeIcon icon={v.isSettingsMenuOpen ? faXmark : faGear}/>
                </button>
                {v.isSettingsMenuOpen && <>
                    <div className="settings-menu-backdrop" onClick={() => d.toggleSettingsMenuRequested()}/>
                    <div className="settings-menu-panel" role="dialog" aria-label={t("settings")}>
                        <div className="settings-menu-row">
                            <span>{t("language")}</span>
                            <LanguageSwitcher/>
                        </div>
                        <div className="settings-menu-row">
                            <span>{t("music")}</span>
                            <button
                                className={`btn ${v.musicEnabled ? 'btn-primary' : 'btn-outline-primary audio-toggle--off'}`}
                                aria-pressed={v.musicEnabled}
                                title={t("music")}
                                onClick={() => d.toggleMusicRequested()}>
                                <FontAwesomeIcon icon={faMusic}/>
                            </button>
                        </div>
                        <div className="settings-menu-row">
                            <span>{t("sounds")}</span>
                            <button
                                className={`btn ${v.soundsEnabled ? 'btn-primary' : 'btn-outline-primary audio-toggle--off'}`}
                                aria-pressed={v.soundsEnabled}
                                title={t("sounds")}
                                onClick={() => d.toggleSoundsRequested()}>
                                <FontAwesomeIcon icon={v.soundsEnabled ? faVolumeHigh : faVolumeXmark}/>
                            </button>
                        </div>
                    </div>
                </>}
            </div>
            <h1 className="game-title">{t("title")}</h1>
            <div className="d-flex flex-column gap-2 text-center">
                <div className="row">
                    <label className="fs-3">{t("cardCount")}</label>
                    <div className=" d-flex gap-2 justify-content-center flex-wrap">
                        {v.cardCountOptions.map((option) => <button
                                key={option}
                                className={`btn ${v.cardCount === option ? 'btn-primary' : 'btn-outline-primary'}`}
                                onClick={() => d.setCardCountRequested(option)}>
                                {option}
                            </button>
                        )}
                    </div>
                </div>
            </div>
            <button onClick={() => d.startGameRequested()}
                    className="btn btn-lg btn-primary px-2 mt-1 fs-1">
                <FontAwesomeIcon icon={faStar}/> {t('start')} <FontAwesomeIcon icon={faStar}/>
            </button>
        </div>
    );
};
