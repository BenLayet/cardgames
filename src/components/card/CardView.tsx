import type {Card } from "../../model/deck.model.ts";
import "../../../src/style/components/card.css";

const getCardImage = (card: Card) => {
    return new URL(`../../assets/cards/${card}.svg`, import.meta.url).href;
};

const getCardBackImage = () => {
    return new URL(`../../assets/cards/2B.svg`, import.meta.url).href;
};

export const CardView = ({card="1S" as Card, faceUp = true}) => {
    return (
        <div className="card-view">
            <img src={faceUp ? getCardImage(card) : getCardBackImage()} alt={`card ${card}`} className="card-image"/>
        </div>
    )
};