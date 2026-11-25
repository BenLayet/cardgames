import {useSofter} from "@softer-components/redux-adapter";

import type {BattleContract} from "./battle.component";
import {Game} from "./game";
import {GameBar} from "../../game-bar/GameBar.tsx";
import {Setup} from "../setup";

export const View = ({path = ""}) => {
    const [v, d, c] = useSofter<BattleContract>(path);
    return (
        <div className="vstack p-2 justify-content-between position-relative" style={{backgroundColor: '', position: 'relative'}}>

            {v.isStartable && <Setup path={c.setup}/>}
            {v.shouldMenuBeVisible && <GameBar onBack={() => d.goHomeRequested()} rules="bataille"/>}
            {v.isStarted && <Game path={c.game}/>}
        </div>
    );
};
