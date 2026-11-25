import type {ReactNode, Ref} from "react";
import {useTranslation} from "react-i18next";

// What belongs to the game in progress, laid on the felt: a status line at the bottom in the middle, and the actions
// in the bottom right corner, under the right thumb (in a row when the screen is upright, in a column when sideways)
// The refs let a game measure the room left above them.
export const TableActions = ({status, children, statusRef, actionsRef}: {
    status?: ReactNode, children?: ReactNode, statusRef?: Ref<HTMLDivElement>, actionsRef?: Ref<HTMLDivElement>,
}) => {
    const {t} = useTranslation();
    return <>
        <div ref={statusRef} className="table-status" role="status">{status}</div>
        {children && <div ref={actionsRef} className="table-actions" role="toolbar" aria-label={t("gameActions")}>{children}</div>}
    </>;
};
