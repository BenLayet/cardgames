import {useTranslation} from "react-i18next";

import {GAMES} from "../../model/games.model.ts";
import {Modal} from "../modal/Modal.tsx";

// What the application is, and which version was deployed
export const About = ({onClose}: { onClose: () => void }) => {
    const {t, i18n} = useTranslation();
    const games = GAMES.filter(game => game.available).map(game => t(`games.${game.id}`));
    return <Modal title={t("about.title")} onClose={onClose}>
        <p>{t("about.intro", {count: games.length, games: new Intl.ListFormat(i18n.language).format(games)})}</p>
        <p>{t("about.free")}</p>
        {/* what was deployed: version, commit and build date */}
        <div className="modal-footnote">
            {t("version")} {__APP_VERSION__.version} · {__APP_VERSION__.commit} · {new Date(__APP_VERSION__.builtAt).toLocaleDateString(i18n.language)}
        </div>
    </Modal>;
};
