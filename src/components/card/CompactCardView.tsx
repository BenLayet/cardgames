import {useTranslation} from "react-i18next";

import type {Card, Rank, Suit} from "../../model/deck.model.ts";

const SUIT_SYMBOLS: Record<Suit, string> = {S: "♠", H: "♥", D: "♦", C: "♣"};
const isRed = (suit: Suit) => suit === "H" || suit === "D";
const FACE_RANKS: readonly Rank[] = ["J", "Q", "K"];

// Where the symbols go on each card, as on a traditional deck:
// [left, top] in percent of the area below the top line; the symbols of the lower half are upside down
const L = 18, C = 50, R = 82;
const PIPS: Partial<Record<Rank, [number, number][]>> = {
    A: [[C, 50]],
    "2": [[C, 0], [C, 100]],
    "3": [[C, 0], [C, 50], [C, 100]],
    "4": [[L, 0], [R, 0], [L, 100], [R, 100]],
    "5": [[L, 0], [R, 0], [C, 50], [L, 100], [R, 100]],
    "6": [[L, 0], [R, 0], [L, 50], [R, 50], [L, 100], [R, 100]],
    "7": [[L, 0], [R, 0], [C, 25], [L, 50], [R, 50], [L, 100], [R, 100]],
    "8": [[L, 0], [R, 0], [C, 25], [L, 50], [R, 50], [C, 75], [L, 100], [R, 100]],
    "9": [[L, 0], [R, 0], [L, 33], [R, 33], [C, 50], [L, 67], [R, 67], [L, 100], [R, 100]],
    T: [[L, 0], [R, 0], [C, 17], [L, 33], [R, 33], [L, 67], [R, 67], [C, 83], [L, 100], [R, 100]],
};

const faceImage = (card: Card) => new URL(`../../assets/cards/${card}.svg`, import.meta.url).href;

// A card drawn for small sizes, readable when the detailed pictures of CardView would not be:
// the value and the suit on the top line, so that they show even when the card is covered,
// then the symbols laid out as on a traditional card, or the head of the figure
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
        {FACE_RANKS.includes(rank)
            ? <div className="compact-card-face" aria-hidden="true"><img src={faceImage(card)} alt=""/></div>
            : <div className={`compact-card-pips ${rank === "A" ? "compact-card-pips--ace" : ""}`} aria-hidden="true">
                {(PIPS[rank] ?? []).map(([left, top], i) =>
                    <span key={i} className={top > 50 ? "compact-card-pip--down" : ""}
                          style={{left: `${left}%`, top: `${top}%`}}>{symbol}</span>)}
            </div>}
    </div>;
};
