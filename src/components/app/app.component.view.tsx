import {useSofter} from "@softer-components/redux-adapter";
import {useEffect} from "react";

import type {AppContract} from "./app.component";
import {Battle} from "./battle";
import {Settings} from "./settings";

export const View = ({path = ""}) => {
    const [v, d, c] = useSofter<AppContract>(path);
    useEffect(() => {
        d.displayed();
    }, [d]);
    return (
        <>
            {v.areSettingsAvailable && <Settings path={c.settings}/>}
            {/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- there is only one page for now */}
            {v.page === "BATTLE" && <Battle path={c.battle}/>}
        </>
    );
};
