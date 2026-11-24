import {useSofter} from "@softer-components/redux-adapter";
import {useEffect} from "react";

import type {AppContract} from "./app.component";
import {Battle} from "./battle";
import {Settings} from "./settings";
import {Home} from "./home/home.view";

export const View = ({path = ""}) => {
    const [v, d, c] = useSofter<AppContract>(path);
    useEffect(() => {
        d.displayed();
    }, [d]);
    return (
        <>
            {v.areSettingsAvailable && <Settings path={c.settings}/>}
            {v.page === "HOME" && <Home onGameSelected={gameId => d.gameSelected(gameId)}/>}
            {v.page === "bataille" && <Battle path={c.battle}/>}
        </>
    );
};
