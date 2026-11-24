import {useSofter} from "@softer-components/redux-adapter";

import type {BattleContract} from "./battle.component";
import {useTranslation} from "react-i18next";
import {Game} from "./game";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowLeft} from "@fortawesome/free-solid-svg-icons";
import {Setup} from "../setup";

export const View = ({path = ""}) => {
    const [v, d, c] = useSofter<BattleContract>(path);
    const {t} = useTranslation();
    return (
        <div className="vstack p-2 justify-content-between position-relative" style={{backgroundColor: '', position: 'relative'}}>

            {v.isStartable && <Setup path={c.setup}/>}
            {v.shouldMenuBeVisible && <div className="m-2">
                <button
                    className="btn btn-primary"
                    title={t('back')}
                    onClick={() => d.goHomeRequested()}
                >
                    <FontAwesomeIcon icon={faArrowLeft}/>
                </button>
            </div>}
            {v.isStarted && <Game path={c.game}/>}
        </div>
    );
};
