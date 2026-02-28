import {useSofter} from "@softer-components/redux-adapter";

import type {GameContract} from "./game.component.ts";
import {StackView} from "../../../stack/StackView.tsx";

export const View = ({path = ""}) => {
    const [v, d] = useSofter<GameContract>(path);
    return <div
        onClick={() => d.player1Clicked()} style={{cursor: "pointer"}}>
        <div className="d-flex justify-content-end position-relative">
            <div id="player2WonCards" style={{width: '143px', height: '200px', position: 'relative'}}>
                <StackView cards={v.player2WonCards} allUp={true}/>
            </div>
            <StackView cards={v.player2Cards}/>
        </div>
        <div className="hstack" style={{position:"relative"}}>
            <div className="hstack flex-grow-1 m-5 ">
                <div id="player1BeingPlayedCard" style={{width: '143px', height: '200px', position: 'relative'}}>
                    <StackView cards={v.player1BeingPlayedCards} upStates={v.player1BeingPlayedUpStates}/>
                </div>
            </div>
            <div className="hstack flex-grow-1 justify-content-end m-5 ">
                <div id="player2BeingPlayedCard" style={{width: '143px', height: '200px', position: 'relative'}}>
                    <StackView cards={v.player2BeingPlayedCards} upStates={v.player2BeingPlayedUpStates}/>
                </div>
            </div>
        </div>
        <div className="d-flex justify-content-start position-relative">
            <StackView cards={v.player1Cards}/>
            <div id="player1WonCards" style={{width: '143px', height: '200px', position: 'relative'}}>
                <StackView cards={v.player1WonCards} allUp={true}/>
            </div>
        </div>
    </div>
};
