import {useContext, useState} from "react";
import {useTranslation} from "react-i18next";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowLeft, faCircleInfo, faCircleQuestion} from "@fortawesome/free-solid-svg-icons";

import {SettingsSlot} from "./settings-slot.ts";
import {About} from "./About.tsx";
import {type ScreenLevel, useHistoryLevel} from "./useHistoryLevel.ts";
import {RulesModal} from "./RulesLink.tsx";
import type {GameWithRules} from "./rules.ts";

// The bar at the top of every screen: the way back on the left, the name of the screen, and on the right what
// concerns the whole application (about, settings).
// The home page has no way back: it shows the logo of the application instead.
// During a game, a question mark shows the rules of the game over the table, which stays as it is.
export const AppBar = ({title, level, onBack, rulesOf}: {
    title: string, level: ScreenLevel, onBack?: () => void, rulesOf?: GameWithRules,
}) => {
    const {t} = useTranslation();
    const settings = useContext(SettingsSlot);
    // only a window over the screen, nothing else depends on it
    const [isAboutOpen, setAboutOpen] = useState(false);
    const [areRulesOpen, setRulesOpen] = useState(false);
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
        {rulesOf && <button className="btn app-bar-button" title={t("rules.title")} aria-label={t("rules.title")}
                            onClick={() => setRulesOpen(true)}>
            <FontAwesomeIcon icon={faCircleQuestion}/>
        </button>}
        {settings}
        {isAboutOpen && <About onClose={() => setAboutOpen(false)}/>}
        {rulesOf && areRulesOpen && <RulesModal gameId={rulesOf} onClose={() => setRulesOpen(false)}/>}
    </header>;
};
