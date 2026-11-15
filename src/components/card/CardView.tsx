import type {Card } from "../../model/deck.model.ts";

const getCardImage = (card: Card) => {
    return new URL(`../../assets/cards/${card}.svg`, import.meta.url).href;
};

const getCardBackImage = () => {
    return new URL(`../../assets/cards/2B.svg`, import.meta.url).href;
};

// Both faces are rendered back to back; toggling faceUp flips the card in 3D
export const CardView = ({card="1S" as Card, faceUp = true}) => {
    return (
        <div className={`card-flip ${faceUp ? "" : "card-flip--face-down"}`}>
            <div className="card-flip-inner">
                <img className="card-image card-face" src={getCardImage(card)} alt={`card ${card}`} height={200}/>
                <img className="card-image card-face card-face--back" src={getCardBackImage()} alt="card back" height={200}/>
            </div>
        </div>
    )
};
