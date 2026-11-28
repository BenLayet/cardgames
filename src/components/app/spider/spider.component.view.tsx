import {useSofter} from "@softer-components/redux-adapter";

import type {SpiderContract} from "./spider.component";
import {Game} from "./game";
import {Setup} from "../setup";
import {SpiderRecords} from "./records/SpiderRecords.tsx";
import {SpiderVictory} from "./records/SpiderVictory.tsx";

export const View = ({path = ""}) => {
    const [v, d, c] = useSofter<SpiderContract>(path);
    // the records open from the top bar, on the menu as during the game
    const records = <SpiderRecords wins={v.wins} variant={v.variant} latest={v.victory?.win ?? null}
                                   onClear={() => d.recordsCleared()}/>;
    return (
        <main className="vstack p-1 p-sm-2 position-relative">
            {v.isStartable && <Setup path={c.setup} barActions={records}
                                     onResume={v.canResume ? () => d.resumeRequested() : undefined}/>}
            {v.isStarted && <Game path={c.game} onBack={() => d.goHomeRequested()} barActions={records}
                                  victory={v.victory && <SpiderVictory {...v.victory}/>}/>}
        </main>
    );
};
