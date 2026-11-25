import {useTranslation} from "react-i18next";

import type {Card, Rank, Suit} from "../../model/deck.model.ts";

const SUIT_SYMBOLS: Record<Suit, string> = {S: "♠", H: "♥", D: "♦", C: "♣"};
const isRed = (suit: Suit) => suit === "H" || suit === "D";

// A card drawn with text, readable when it is too small for the detailed pictures of CardView:
// the value and the suit on the top line, so that they show even when the card is covered
export const CompactCardView = ({card = "AS" as Card, faceUp = true}) => {
    const {t} = useTranslation();
    if (!faceUp) return <div className="card-image compact-card compact-card--back" role="img" aria-label="card back"/>;
    const rank = card.charAt(0) as Rank;
    const suit = card.charAt(1) as Suit;
    const symbol = SUIT_SYMBOLS[suit];
    return <div className={`card-image compact-card ${isRed(suit) ? "compact-card--red" : ""}`}
                role="img" aria-label={`card ${card}`}>
        <div className="compact-card-corner">
            <span>{t(`ranks.${rank}`)}</span><span>{symbol}</span>
        </div>
        <div className="compact-card-center" aria-hidden="true">{symbol}</div>
    </div>;
};
