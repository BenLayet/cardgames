import {useSofter} from "@softer-components/redux-adapter";
import {useTranslation} from "react-i18next";
import {useEffect} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faGear, faMusic, faVolumeHigh, faVolumeLow, faVolumeXmark, faXmark, type IconDefinition} from "@fortawesome/free-solid-svg-icons";

import type {SettingsContract} from "./settings.component.ts";
import type {Language} from "../../../services/language.service.ts";

// written in their own language, so they can be recognized whatever the current language
const LANGUAGE_LABELS: Record<Language, { flag: string, name: string, switchTo: string }> = {
    en: {flag: "🇬🇧", name: "English", switchTo: "Switch to English"},
    fr: {flag: "🇫🇷", name: "Français", switchTo: "Changer la langue en français"},
};

// far left is off, and shows it: crossed out speaker, greyed slider, "off" written instead of the percentage
const VolumeRow = ({label, offLabel, icon, volume, onChange}: {
    label: string, offLabel: string, icon: IconDefinition, volume: number, onChange: (volume: number) => void,
}) => {
    const isOff = volume <= 0;
    return (
        <div className={`settings-menu-row settings-volume${isOff ? " settings-volume--off" : ""}`}>
            <span>{label}</span>
            <span className="settings-volume-control">
                <FontAwesomeIcon className="settings-volume-icon" icon={isOff ? faVolumeXmark : icon}/>
                <input
                    type="range" min={0} max={100} step={5}
                    value={volume}
                    aria-label={label}
                    aria-valuetext={isOff ? offLabel : `${volume} %`}
                    onChange={e => onChange(Number(e.target.value))}/>
                <span className="settings-volume-value">{isOff ? offLabel : `${volume} %`}</span>
            </span>
        </div>
    );
};

export const View = ({path = ""}) => {
    const [v, d] = useSofter<SettingsContract>(path);
    const {t} = useTranslation();
    // the Escape key closes the menu, like the other windows over the screen
    useEffect(() => {
        if (!v.isMenuOpen) return;
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") d.toggleMenuRequested();
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [v.isMenuOpen, d]);
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
                    <VolumeRow
                        label={t("music")} offLabel={t("musicOff")} icon={faMusic}
                        volume={v.musicVolume}
                        onChange={volume => d.setMusicVolumeRequested(volume)}/>
                    <VolumeRow
                        label={t("sounds")} offLabel={t("soundsOff")} icon={v.soundsVolume < 50 ? faVolumeLow : faVolumeHigh}
                        volume={v.soundsVolume}
                        onChange={volume => d.setSoundsVolumeRequested(volume)}/>
                </div>
            </>}
        </div>
    );
};
