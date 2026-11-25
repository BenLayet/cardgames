import {useContext, useState} from "react";
import {useTranslation} from "react-i18next";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowLeft, faCircleInfo} from "@fortawesome/free-solid-svg-icons";

import {SettingsSlot} from "./settings-slot.ts";
import {About} from "./About.tsx";
import {type ScreenLevel, useHistoryLevel} from "./useHistoryLevel.ts";

// The bar at the top of every screen: the way back on the left, the name of the screen, and on the right what
// concerns the whole application (about, settings).
// The home page has no way back: it shows the logo of the application instead.
export const AppBar = ({title, level, onBack}: { title: string, level: ScreenLevel, onBack?: () => void }) => {
    const {t} = useTranslation();
    const settings = useContext(SettingsSlot);
    // only a window over the screen, nothing else depends on it
    const [isAboutOpen, setAboutOpen] = useState(false);
    useHistoryLevel(level, onBack);
    return <header className="app-bar">
        {onBack
            ? <button className="btn app-bar-button" title={t("back")} aria-label={t("back")} onClick={onBack}>
                <FontAwesomeIcon icon={faArrowLeft}/>
            </button>
            : <img className="app-bar-logo" src="/favicon.svg" alt="" aria-hidden="true"/>}
        <h1 className="app-bar-title">{title}</h1>
        <button className="btn app-bar-button" title={t("about.button")} aria-label={t("about.button")}
                onClick={() => setAboutOpen(true)}>
            <FontAwesomeIcon icon={faCircleInfo}/>
        </button>
        {settings}
        {isAboutOpen && <About onClose={() => setAboutOpen(false)}/>}
    </header>;
};
