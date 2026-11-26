import {useTranslation} from "react-i18next";

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
