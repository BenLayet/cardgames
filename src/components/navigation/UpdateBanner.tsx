import {useState} from "react";
import {useTranslation} from "react-i18next";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faDownload} from "@fortawesome/free-solid-svg-icons";

import {useAppUpdate, useAppUpdateMessage} from "./useAppUpdate.ts";

// At the bottom of every screen, once a newer version is downloaded: the player switches to it now, or later.
// Nothing reloads without the player; "Later" hides the banner until the application starts again.
export const UpdateBanner = () => {
    const {t} = useTranslation();
    const update = useAppUpdate();
    const message = useAppUpdateMessage(update);
    const [isDismissed, setDismissed] = useState(false);
    if (update.status !== "ready" || isDismissed) return null;
    return <div className="update-banner" role="status">
        <span className="update-banner-message">{message}</span>
        <span className="update-banner-actions">
            <button className="btn btn-outline-primary btn-sm" onClick={() => setDismissed(true)}>{t("update.later")}</button>
            <button className="btn btn-primary btn-sm" onClick={update.install}>
                <FontAwesomeIcon icon={faDownload}/> {t("update.install")}
            </button>
        </span>
    </div>;
};
