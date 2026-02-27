import {CardView} from '../card/CardView.tsx';
import type {Card} from "../../model/deck.model";


export const StackView = ({cards = [] as Card[], up = true}) => <div
    style={{position: "relative", minWidth: "200px", minHeight: "230px"}}>{
    cards.map((card, i) => <div key={i}
                                style={{
                                    position: "absolute",
                                    top: `${i}px`,
                                    left: `${i}px`,
                                    zIndex: `${cards.length - i}`,
                                }}>
            <CardView card={card} up={up}/>
        </div>
    )
}</div>