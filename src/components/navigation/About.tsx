import {useTranslation} from "react-i18next";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowsRotate, faCode, faDownload} from "@fortawesome/free-solid-svg-icons";

import {GAMES} from "../../model/games.model.ts";
import {Modal} from "../modal/Modal.tsx";
import {useAppUpdate, useAppUpdateMessage} from "./useAppUpdate.ts";

const REPOSITORY_URL = "https://github.com/BenLayet/cardgames";
// the source code of the running version: the commit it was built from, or the repository when it is not known
const sourceCodeUrl = __APP_VERSION__.commit === "unknown" ? REPOSITORY_URL : `${REPOSITORY_URL}/commit/${__APP_VERSION__.commit}`;

// What the application is, which version was deployed, and whether a newer one is ready
export const About = ({onClose}: { onClose: () => void }) => {
    const {t, i18n} = useTranslation();
    const update = useAppUpdate();
    const updateMessage = useAppUpdateMessage(update);
    const games = GAMES.filter(game => game.available).map(game => t(`games.${game.id}`));
    return <Modal title={t("about.title")} onClose={onClose}>
        <p>{t("about.intro", {count: games.length, games: new Intl.ListFormat(i18n.language).format(games)})}</p>
        <p>{t("about.free")}</p>
        <p>
            <a href={sourceCodeUrl} target="_blank" rel="noopener noreferrer">
                <FontAwesomeIcon icon={faCode}/> {t("about.sourceCode")}
            </a>
        </p>
        {/* what was deployed: version and build date */}
        <div className="modal-footnote">
            {t("version")} {__APP_VERSION__.version} · {new Date(__APP_VERSION__.builtAt).toLocaleDateString(i18n.language)}
        </div>
        {/* the installed application is not reloaded when it comes back: a newer version can be asked for here */}
        <div className="app-update">
            {update.status === "ready"
                ? <button className="btn btn-primary" onClick={update.install}>
                    <FontAwesomeIcon icon={faDownload}/> {t("update.install")}
                </button>
                : <button className="btn btn-outline-primary" disabled={update.status === "checking" || update.status === "downloading"}
                          onClick={() => void update.check()}>
                    <FontAwesomeIcon icon={faArrowsRotate} spin={update.status === "checking"}/> {t("update.check")}
                </button>}
            {updateMessage && <p className="app-update-message" role="status">{updateMessage}</p>}
        </div>
    </Modal>;
};
