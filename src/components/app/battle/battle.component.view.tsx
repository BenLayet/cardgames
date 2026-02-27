import {useSofter} from "@softer-components/redux-adapter";

import type {BattleContract} from "./battle.component";
import {useTranslation} from "react-i18next";
import {Game} from "./game";

export const View = ({path = ""}) => {
    const [v, d, c] = useSofter<BattleContract>(path);
    const {t} = useTranslation();
    return (
        <div className="vstack  justify-content-between p-4" style={{backgroundColor: '#115511'}}>
            {v.isStartable && <div className="vstack justify-content-center align-items-center">
                <button style={{fontSize: "5em"}} className="btn btn-primary px-5 "
                        onClick={() => d.startGameRequested()}>
                    ★{t('ready')}★
                </button>
            </div>}
            {v.isStarted && <Game path={c.game}/>}
        </div>
    );
};
