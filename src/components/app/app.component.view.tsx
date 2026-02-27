import {useSofter} from "@softer-components/redux-adapter";
import {useEffect} from "react";

import type {AppContract} from "./app.component";
import {Battle} from "./battle";

export const View = ({path = ""}) => {
    const [v, d, c] = useSofter<AppContract>(path);
    useEffect(() => {
        d.displayed();
    }, [d]);
    return (
        <>
            {v.page === "GAME" && <Battle path={c.battle}/>}
        </>
    );
};
