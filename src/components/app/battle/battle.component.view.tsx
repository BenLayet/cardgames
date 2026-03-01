import {useSofter} from "@softer-components/redux-adapter";

import type {BattleContract} from "./battle.component";
import {useTranslation} from "react-i18next";
import {Game} from "./game";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faHome, faStar} from "@fortawesome/free-solid-svg-icons";

export const View = ({path = ""}) => {
    const [v, d, c] = useSofter<BattleContract>(path);
    const {t} = useTranslation();
    return (
        <div className="vstack  justify-content-between p-4" style={{backgroundColor: '#115511', position: 'relative'}}>
            {v.isStartable && <div className="vstack justify-content-center align-items-center"
                                   onClick={() => d.startGameRequested()}>
                <button style={{fontSize: "5em"}} className="btn btn-primary px-5 ">
                    <FontAwesomeIcon icon={faStar} />{t('ready')}<FontAwesomeIcon icon={faStar} />
                </button>
            </div>}
            {v.isStarted && <Game path={c.game}/>}
            {v.shouldMenuBeVisible && <div style={{position: 'absolute'}}>
                <div className="menu">
                    {/* Home Icon Button */}
                    <button
                        className="btn btn btn-primary"
                        style={{
                            top: '1rem',
                            left: '1rem',
                            fontSize: '1.5em',
                            padding: '0.5rem 0.75rem',
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
