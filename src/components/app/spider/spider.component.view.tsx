import {useSofter} from "@softer-components/redux-adapter";
import {useTranslation} from "react-i18next";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowLeft, faPlay} from "@fortawesome/free-solid-svg-icons";

import type {SpiderContract} from "./spider.component";
import {Game} from "./game";
import {Setup} from "../setup";

export const View = ({path = ""}) => {
    const [v, d, c] = useSofter<SpiderContract>(path);
    const {t} = useTranslation();
    return (
        <div className="vstack p-1 p-sm-2 position-relative">
            {v.isStartable && <Setup path={c.setup}/>}
            {v.canResume && <div className="text-center mt-3">
                <button className="btn btn-lg btn-outline-primary" onClick={() => d.resumeRequested()}>
                    <FontAwesomeIcon icon={faPlay}/> {t("resumeGame")}
                </button>
            </div>}
            {v.isStarted && <>
                <div className="m-2">
                    <button className="btn btn-primary" title={t("back")} aria-label={t("back")}
                            onClick={() => d.goHomeRequested()}>
                        <FontAwesomeIcon icon={faArrowLeft}/>
                    </button>
                </div>
                <Game path={c.game}/>
            </>}
        </div>
    );
};
