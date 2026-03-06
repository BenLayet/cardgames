import {useSofter} from "@softer-components/redux-adapter";

import type {BattleContract} from "./battle.component";
import {useTranslation} from "react-i18next";
import {Game} from "./game";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faHome} from "@fortawesome/free-solid-svg-icons";
import {StartScreen} from "./start-screen";

export const View = ({path = ""}) => {
    const [v, d, c] = useSofter<BattleContract>(path);
    const {t} = useTranslation();
    return (
        <div className="vstack p-2 justify-content-between position-relative" style={{backgroundColor: '', position: 'relative'}}>

            {v.isStartable && <StartScreen path={c.startScreen}/>}
            {v.shouldMenuBeVisible && <div className="m-2">
                <button
                    className="btn btn-primary"
                    title={t('goHome')}
                    onClick={() => d.goHomeRequested()}
                >
                    <FontAwesomeIcon icon={faHome}/>
                </button>
            </div>}
            {v.isStarted && <Game path={c.game}/>}
        </div>
    );
};
