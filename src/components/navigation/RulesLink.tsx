import {useState} from "react";
import {useTranslation} from "react-i18next";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBook} from "@fortawesome/free-solid-svg-icons";

import {Modal} from "../modal/Modal.tsx";
import type {GameWithRules} from "./rules.ts";

type RuleSection = { title: string, text: string };

// The rules of a game, as they are played in the application, in a window over the screen
export const RulesModal = ({gameId, onClose}: { gameId: GameWithRules, onClose: () => void }) => {
    const {t} = useTranslation();
    const sections = t(`rules.${gameId}`, {returnObjects: true}) as RuleSection[];
    return <Modal title={`${t("rules.title")} · ${t(`games.${gameId}`)}`} onClose={onClose}>
        {sections.map(section => <section key={section.title}>
            <h3 className="modal-section-title">{section.title}</h3>
            <p>{section.text}</p>
        </section>)}
    </Modal>;
};

// A link that shows the rules of a game, on the menu of the game
export const RulesLink = ({gameId}: { gameId: GameWithRules }) => {
    const {t} = useTranslation();
    // only a window over the screen, nothing else depends on it
    const [isOpen, setOpen] = useState(false);
    return <>
        <button className="btn btn-link rules-link" onClick={() => setOpen(true)}>
            <FontAwesomeIcon icon={faBook}/> {t("rules.read")}
        </button>
        {isOpen && <RulesModal gameId={gameId} onClose={() => setOpen(false)}/>}
    </>;
};
