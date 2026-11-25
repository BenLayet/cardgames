import type {ReactNode} from "react";
import {useTranslation} from "react-i18next";

// What belongs to the game in progress, laid on the felt: a status line at the bottom in the middle, and the actions
// in the bottom right corner, under the right thumb (in a row when the screen is upright, in a column when sideways)
export const TableActions = ({status, children}: { status?: ReactNode, children?: ReactNode }) => {
    const {t} = useTranslation();
    return <>
        <div className="table-status" role="status">{status}</div>
        {children && <div className="table-actions" role="toolbar" aria-label={t("gameActions")}>{children}</div>}
    </>;
};
