import type {Card } from "../../model/deck.model.ts";

export const CardView = ({card="1S" as Card, up = true}) => {
    return (
        <div>
            <img src={up ? `/cards/${card}.svg` : "/cards/2B.svg"} alt={`card ${card}`} height={200}/>
        </div>
    )
};