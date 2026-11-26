import {useSofter} from "@softer-components/redux-adapter";
import {useTranslation} from "react-i18next";

import type {BattleContract} from "./battle.component";
import {Game} from "./game";
import {AppBar} from "../../navigation/AppBar.tsx";
import {Setup} from "../setup";

export const View = ({path = ""}) => {
    const [v, d, c] = useSofter<BattleContract>(path);
    const {t} = useTranslation();
    return (
        <main className="vstack p-2 justify-content-between position-relative">

            {v.isStartable && <Setup path={c.setup} onResume={v.canResume ? () => d.resumeRequested() : undefined}/>}
            {v.shouldMenuBeVisible && <AppBar title={t("games.bataille")} level={2} onBack={() => d.goHomeRequested()} rulesOf="bataille"/>}
            {v.isStarted && <Game path={c.game}/>}
        </main>
    );
};
