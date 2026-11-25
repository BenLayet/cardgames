import {type ReactNode, useContext} from "react";
import {useTranslation} from "react-i18next";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowLeft} from "@fortawesome/free-solid-svg-icons";

import {SettingsSlot} from "./settings-slot.ts";

// The bar shared by every screen after the home page: back first, then the settings, a short status,
// and the actions of the game.
// It lies at the bottom of the screen held upright and on the right side of the screen held sideways.
export const GameBar = ({onBack, status, children}: { onBack: () => void, status?: ReactNode, children?: ReactNode }) => {
    const {t} = useTranslation();
    const settings = useContext(SettingsSlot);
    return <nav className="game-bar" aria-label={t("gameActions")}>
        <button className="btn btn-outline-primary" title={t("back")} aria-label={t("back")} onClick={onBack}>
            <FontAwesomeIcon icon={faArrowLeft}/>
        </button>
        {settings}
        <div className="game-bar-status" role="status">{status}</div>
        <div className="game-bar-actions">{children}</div>
    </nav>;
};
