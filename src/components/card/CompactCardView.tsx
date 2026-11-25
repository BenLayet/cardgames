import type {CSSProperties} from "react";
import {useTranslation} from "react-i18next";

import type {Card, Rank, Suit} from "../../model/deck.model.ts";

// The suits drawn as on the detailed cards: the four have the same size, whatever the font of the device
const SUIT_PATHS: Record<Suit, string> = {
    S: "M0 -500C100 -250 355 -100 355 185A150 150 0 0 1 55 185A10 10 0 0 0 35 185C35 385 85 400 130 500L-130 500C-85 400 -35 385 -35 185A10 10 0 0 0 -55 185A150 150 0 0 1 -355 185C-355 -100 -100 -250 0 -500Z",
    H: "M0 -300C0 -400 100 -500 200 -500C300 -500 400 -400 400 -250C400 0 0 400 0 500C0 400 -400 0 -400 -250C-400 -400 -300 -500 -200 -500C-100 -500 0 -400 -0 -300Z",
    D: "M-400 0C-350 0 0 -450 0 -500C0 -450 350 0 400 0C350 0 0 450 0 500C0 450 -350 0 -400 0Z",
    C: "M30 150C35 385 85 400 130 500L-130 500C-85 400 -35 385 -30 150A10 10 0 0 0 -50 150A210 210 0 1 1 -124 -51A10 10 0 0 0 -110 -65A230 230 0 1 1 110 -65A10 10 0 0 0 124 -51A210 210 0 1 1 50 150A10 10 0 0 0 30 150Z",
};
const SuitSymbol = ({suit}: { suit: Suit }) =>
    <svg className="compact-card-suit" viewBox="-500 -500 1000 1000" aria-hidden="true"><path d={SUIT_PATHS[suit]}/></svg>;
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

// The size of the symbols, in card widths: the fewer they are, the bigger
const pipSize = (count: number) => {
    if (count === 1) return 0.62;
    if (count === 2) return 0.36;
    if (count === 3) return 0.26;
    if (count <= 6) return 0.3;
    return count <= 8 ? 0.27 : 0.25;
};

const faceImage = (card: Card) => new URL(`../../assets/cards/${card}.svg`, import.meta.url).href;

// A card drawn for small sizes, readable when the detailed pictures of CardView would not be:
// the value and the suit on the top line, so that they show even when the card is covered,
// then the symbols laid out as on a traditional card, or the head and shoulders of the figure in a frame
export const CompactCardView = ({card = "AS" as Card, faceUp = true}) => {
    const {t} = useTranslation();
    if (!faceUp) return <div className="card-image compact-card compact-card--back" role="img" aria-label="card back"/>;
    const rank = card.charAt(0) as Rank;
    const suit = card.charAt(1) as Suit;
    const pips = PIPS[rank] ?? [];
    return <div className={`card-image compact-card ${isRed(suit) ? "compact-card--red" : ""}`}
                role="img" aria-label={`card ${card}`}>
        <div className="compact-card-corner">
            <span>{t(`ranks.${rank}`)}</span><SuitSymbol suit={suit}/>
        </div>
        {FACE_RANKS.includes(rank)
            ? <div className="compact-card-face" aria-hidden="true"><img src={faceImage(card)} alt=""/></div>
            : <div className="compact-card-pips" style={{"--pip": pipSize(pips.length)} as CSSProperties} aria-hidden="true">
                {pips.map(([left, top], i) =>
                    <span key={i} className={top > 50 ? "compact-card-pip--down" : ""}
                          style={{left: `${left}%`, top: `${top}%`}}><SuitSymbol suit={suit}/></span>)}
            </div>}
    </div>;
};
