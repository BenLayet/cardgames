import {useState} from "react";
import {useTranslation} from "react-i18next";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBook} from "@fortawesome/free-solid-svg-icons";

import {Modal} from "../modal/Modal.tsx";
import type {GameWithRules} from "./rules.ts";

type RuleSection = { title: string, text: string };

// A button that shows the rules of a game, as they are played in the application
export const RulesButton = ({gameId}: { gameId: GameWithRules }) => {
    const {t} = useTranslation();
    // only a window over the screen, nothing else depends on it
    const [isOpen, setOpen] = useState(false);
    const sections = t(`rules.${gameId}`, {returnObjects: true}) as RuleSection[];
    return <>
        <button className="btn btn-outline-primary" title={t("rules.button")} aria-label={t("rules.button")}
                onClick={() => setOpen(true)}>
            <FontAwesomeIcon icon={faBook}/>
        </button>
        {isOpen && <Modal title={`${t("rules.title")} · ${t(`games.${gameId}`)}`} onClose={() => setOpen(false)}>
            {sections.map(section => <section key={section.title}>
                <h3 className="modal-section-title">{section.title}</h3>
                <p>{section.text}</p>
            </section>)}
        </Modal>}
    </>;
};
