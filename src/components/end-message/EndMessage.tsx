import {type ReactNode, useState} from "react";
import {useTranslation} from "react-i18next";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowLeft, faRotateRight} from "@fortawesome/free-solid-svg-icons";

import {pressGuard} from "./press-guard.ts";

// The message at the end of a game, with what can be done next: play again with the same options, or go back to
// the menu of the game. It leaves the bar at the top usable.
export const EndMessage = ({onPlayAgain, onMenu, children}: { onPlayAgain: () => void, onMenu: () => void, children: ReactNode }) => {
    const {t} = useTranslation();
    const [guard] = useState(pressGuard);
    // the tap that ended the game may be followed by a click on a button that appeared under the finger
    const guarded = (action: () => void) => () => {
        if (guard.clicked()) action();
    };
    return <div className="end-message-overlay" onPointerDown={guard.pressed}>
        {children}
        <div className="end-message-actions">
            <button className="btn btn-lg btn-primary" onClick={guarded(onPlayAgain)}>
                <FontAwesomeIcon icon={faRotateRight}/> {t("playAgain")}
            </button>
            <button className="btn btn-lg btn-outline-primary" onClick={guarded(onMenu)}>
                <FontAwesomeIcon icon={faArrowLeft}/> {t("menu")}
            </button>
        </div>
    </div>;
};
