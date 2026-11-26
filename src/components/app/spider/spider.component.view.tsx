import {useSofter} from "@softer-components/redux-adapter";

import type {SpiderContract} from "./spider.component";
import {Game} from "./game";
import {Setup} from "../setup";

export const View = ({path = ""}) => {
    const [v, d, c] = useSofter<SpiderContract>(path);
    return (
        <main className="vstack p-1 p-sm-2 position-relative">
            {v.isStartable && <Setup path={c.setup} onResume={v.canResume ? () => d.resumeRequested() : undefined}/>}
            {v.isStarted && <Game path={c.game} onBack={() => d.goHomeRequested()}/>}
        </main>
    );
};
