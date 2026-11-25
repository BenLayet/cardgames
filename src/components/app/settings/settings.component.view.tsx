import {useSofter} from "@softer-components/redux-adapter";
import {useTranslation} from "react-i18next";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faGear, faMusic, faVolumeHigh, faVolumeXmark, faXmark} from "@fortawesome/free-solid-svg-icons";

import type {SettingsContract} from "./settings.component.ts";
import type {Language} from "../../../services/language.service.ts";

// written in their own language, so they can be recognized whatever the current language
const LANGUAGE_LABELS: Record<Language, { flag: string, name: string, switchTo: string }> = {
    en: {flag: "🇬🇧", name: "English", switchTo: "Switch to English"},
    fr: {flag: "🇫🇷", name: "Français", switchTo: "Changer la langue en français"},
};

export const View = ({path = ""}) => {
    const [v, d] = useSofter<SettingsContract>(path);
    const {t, i18n} = useTranslation();
    return (
        <div className="settings-menu">
            <button
                className="btn btn-outline-primary"
                title={t("settings")}
                aria-label={t("settings")}
                aria-expanded={v.isMenuOpen}
                onClick={() => d.toggleMenuRequested()}>
                <FontAwesomeIcon icon={v.isMenuOpen ? faXmark : faGear}/>
            </button>
            {v.isMenuOpen && <>
                <div className="settings-menu-backdrop" onClick={() => d.toggleMenuRequested()}/>
                <div className="settings-menu-panel" role="dialog" aria-label={t("settings")}>
                    <div className="settings-menu-row">
                        <span>{t("language")}</span>
                        <span className="d-inline-flex gap-2">
                            {v.languages.map(language => <button
                                key={language}
                                onClick={() => d.setLanguageRequested(language)}
                                className={`btn ${v.language === language ? 'btn-primary' : 'btn-outline-primary'}`}
                                title={LANGUAGE_LABELS[language].name}
                                aria-label={LANGUAGE_LABELS[language].switchTo}>
                                {LANGUAGE_LABELS[language].flag}
                            </button>)}
                        </span>
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
                    {/* what was deployed: version, commit and build date */}
                    <div className="settings-menu-version">
                        {t("version")} {__APP_VERSION__.version} · {__APP_VERSION__.commit} · {new Date(__APP_VERSION__.builtAt).toLocaleDateString(i18n.language)}
                    </div>
                </div>
            </>}
        </div>
    );
};
