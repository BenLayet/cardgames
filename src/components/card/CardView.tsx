import type {Card} from "../../model/deck.model.ts";
import {CompactCardView} from "./CompactCardView.tsx";

// Both faces are rendered back to back; toggling faceUp flips the card in 3D.
// The face that is turned away is hidden from screen readers.
export const CardView = ({card = "AS" as Card, faceUp = true}) =>
    <div className={`card-flip ${faceUp ? "" : "card-flip--face-down"}`}>
        <div className="card-flip-inner">
            <div className="card-face" aria-hidden={!faceUp}><CompactCardView card={card}/></div>
            <div className="card-face card-face--back" aria-hidden={faceUp}><CompactCardView faceUp={false}/></div>
        </div>
    </div>;
