import type {Card } from "../../model/deck.model.ts";

const getCardImage = (card: Card) => {
    return new URL(`../../assets/cards/${card}.svg`, import.meta.url).href;
};

const getCardBackImage = () => {
    return new URL(`../../assets/cards/2B.svg`, import.meta.url).href;
};

export const CardView = ({card="1S" as Card, faceUp = true}) => {
    return (
        <div>
            <img className="card-image" src={faceUp ? getCardImage(card) : getCardBackImage()} alt={`card ${card}`} height={200}/>
        </div>
    )
};