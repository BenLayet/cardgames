import {useTranslation} from "react-i18next";

import type {Card} from "../../model/deck.model.ts";
import {useCardName} from "./useCardName.ts";

// in French the jacks, queens and kings show V, D and R in their corners, see scripts/french-card-faces.ts
const isFigure = (card: Card) => ["J", "Q", "K"].includes(card.charAt(0));
const getCardImage = (card: Card, language: string) => language === "fr" && isFigure(card)
    ? new URL(`../../assets/cards/fr/${card}.svg`, import.meta.url).href
    : new URL(`../../assets/cards/${card}.svg`, import.meta.url).href;

const getCardBackImage = () => {
    return new URL(`../../assets/cards/back.svg`, import.meta.url).href;
};

// Both faces are rendered back to back; toggling faceUp flips the card in 3D
export const CardView = ({card = "AS" as Card, faceUp = true}) => {
    const {t, i18n} = useTranslation();
    const cardName = useCardName();
    return (
        <div className={`card-flip ${faceUp ? "" : "card-flip--face-down"}`}>
            <div className="card-flip-inner">
                <img className="card-image card-face" src={getCardImage(card, i18n.language)} alt={faceUp ? cardName(card) : ""} height={200}/>
                <img className="card-image card-face card-face--back" src={getCardBackImage()} alt={faceUp ? "" : t("cardNames.faceDown")} height={200}/>
            </div>
        </div>
    )
};
