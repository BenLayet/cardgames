import {type ReactNode, useContext} from "react";
import {useTranslation} from "react-i18next";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowLeft} from "@fortawesome/free-solid-svg-icons";

import {SettingsSlot} from "./settings-slot.ts";
import {RulesButton} from "./RulesButton.tsx";
import type {GameWithRules} from "./rules.ts";

// The bar shared by every screen: back first (except on the home page), then the settings and the rules of the game,
// a short status, and the actions of the screen.
// It lies at the bottom of the screen held upright and on the left side of the screen held sideways.
export const GameBar = ({onBack, rules, status, children}: {
    onBack?: () => void, rules?: GameWithRules, status?: ReactNode, children?: ReactNode,
}) => {
    const {t} = useTranslation();
    const settings = useContext(SettingsSlot);
    return <nav className="game-bar" aria-label={t("gameActions")}>
        {onBack && <button className="btn btn-outline-primary" title={t("back")} aria-label={t("back")} onClick={onBack}>
            <FontAwesomeIcon icon={faArrowLeft}/>
        </button>}
        {settings}
        {rules && <RulesButton gameId={rules}/>}
        <div className="game-bar-status" role="status">{status}</div>
        <div className="game-bar-actions">{children}</div>
    </nav>;
};
