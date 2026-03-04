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
        <div className="vstack  justify-content-between p-4" style={{backgroundColor: '#115511', position: 'relative'}}>

            {v.isStartable && <StartScreen path={c.startScreen}/>}
            {v.isStarted && <Game path={c.game}/>}
            {v.shouldMenuBeVisible && <div style={{position: 'absolute'}}>
                <div className="menu">
                    {/* Home Icon Button */}
                    <button
                        className="btn btn btn-primary"
                        style={{
                            top: '1rem',
                            left: '1rem',
                            fontSize: '3em',
                            border: 'none',
                            cursor: 'pointer'
                        }}
                        title={t('goHome')}
                        onClick={() => d.goHomeRequested()}
                    >
                        <FontAwesomeIcon icon={faHome}/>
                    </button>
                </div>
            </div>}
        </div>
    );
};
