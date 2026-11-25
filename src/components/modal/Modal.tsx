import {type ReactNode, useEffect} from "react";
import {useTranslation} from "react-i18next";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faXmark} from "@fortawesome/free-solid-svg-icons";

// A window over the screen, closed by its button, the Escape key or a click beside it
export const Modal = ({title, onClose, children}: { title: string, onClose: () => void, children: ReactNode }) => {
    const {t} = useTranslation();
    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [onClose]);
    return <div className="modal-overlay" onClick={onClose}>
        <div className="modal-panel" role="dialog" aria-modal="true" aria-label={title} onClick={event => event.stopPropagation()}>
            <div className="modal-header">
                <h2 className="modal-title display-font">{title}</h2>
                <button className="btn btn-outline-primary" title={t("close")} aria-label={t("close")} onClick={onClose}>
                    <FontAwesomeIcon icon={faXmark}/>
                </button>
            </div>
            <div className="modal-body">{children}</div>
        </div>
    </div>;
};
