import {type ReactNode, useEffect} from "react";
import {createPortal} from "react-dom";
import {useTranslation} from "react-i18next";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faXmark} from "@fortawesome/free-solid-svg-icons";

// A window over the screen, closed by its button, the Escape key or a click beside it.
// It is drawn at the end of the page, so that it lies over everything (layers.css), whoever opens it.
// A "sheet" rises from the bottom on a phone held upright, and sits above the actions of the game elsewhere.
export const Modal = ({title, onClose, children, placement = "center"}: {
    title: string, onClose: () => void, children: ReactNode, placement?: "center" | "sheet",
}) => {
    const {t} = useTranslation();
    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [onClose]);
    return createPortal(<div className={`modal-overlay modal-overlay--${placement}`} onClick={onClose}>
        <div className="modal-panel" role="dialog" aria-modal="true" aria-label={title} onClick={event => event.stopPropagation()}>
            <div className="modal-header">
                <h2 className="modal-title display-font">{title}</h2>
                <button className="btn btn-outline-primary" title={t("close")} aria-label={t("close")} onClick={onClose}>
                    <FontAwesomeIcon icon={faXmark}/>
                </button>
            </div>
            <div className="modal-body">{children}</div>
        </div>
    </div>, document.body);
};
