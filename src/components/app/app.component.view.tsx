import {useSofter} from "@softer-components/redux-adapter";
import {useEffect} from "react";

import type {AppContract} from "./app.component";
import {Battle} from "./battle";
import {Settings} from "./settings";
import {Spider} from "./spider";
import {Home} from "./home/home.view";
import {SettingsSlot} from "../game-bar/settings-slot.ts";

export const View = ({path = ""}) => {
    const [v, d, c] = useSofter<AppContract>(path);
    useEffect(() => {
        d.displayed();
    }, [d]);
    return (
        <>
            {/* every page shows the settings in its bar */}
            <SettingsSlot.Provider value={<Settings path={c.settings}/>}>
                {v.page === "HOME" && <Home onGameSelected={gameId => d.gameSelected(gameId)}/>}
                {v.page === "bataille" && <Battle path={c.battle}/>}
                {v.page === "spider" && <Spider path={c.spider}/>}
            </SettingsSlot.Provider>
        </>
    );
};
