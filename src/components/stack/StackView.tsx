import {CardView} from '../card/CardView.tsx';
import type {Card} from "../../model/deck.model";

export const StackView = ({cards = [] as Card[], allUp = false, upStates = [] as (boolean|undefined)[]}) => <div
    style={{position: "relative", minWidth: "200px", minHeight: "230px"}}>{
    cards.map((card, i) => <div key={i}
                                style={{
                                    position: "absolute",
                                    bottom: `${i}px`,
                                    left: `${i / 2}px`,
                                    zIndex: `${i}`,
                                }}>
            <CardView card={card} up={allUp || !!upStates[i]}/>
        </div>
    )
}</div>