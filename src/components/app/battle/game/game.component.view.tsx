import {useSofter} from "@softer-components/redux-adapter";

import type {GameContract} from "./game.component.ts";
import {StackView} from "../../../stack/StackView.tsx";
import {CardView} from "../../../card/CardView.tsx";

export const View = ({path = ""}) => {
    const [v, d] = useSofter<GameContract>(path);
    return <>
        <div className="d-flex justify-content-end position-relative">
            <div id="player2WonCards" style={{width: '143px', height: '200px', position: 'relative'}}>
                <StackView cards={v.player2WonCards} up={true}/>
            </div>

            {v.player2BeingPlayedCard && <div id="player2AnimatedCard"
                                              style={{
                                                  minWidth: '200px',
                                                  position: 'absolute',
                                                  zIndex: '100',
                                                  top: 0,
                                                  right: 0
                                              }}
            ><CardView
                card={v.player2BeingPlayedCard} up={v.player2CardRevealed}/>
            </div>}
            <StackView cards={v.player2Cards} up={false}/>
        </div>
        <div className="hstack">
            <div className="hstack flex-grow-1 justify-content-end m-5">
                <div id="player1PlacedCard" style={{width: '143px', height: '200px', position: 'relative'}}>
                </div>
            </div>
            <div className="hstack flex-grow-1 m-5">
                <div id="player2PlacedCard" style={{width: '143px', height: '200px', position: 'relative'}}>
                </div>
            </div>
        </div>
        <div className="d-flex justify-content-start position-relative"
             onClick={d.player1Played}
        >
            {v.player1BeingPlayedCard && <div id="player1AnimatedCard"
                                              onClick={d.player1Played}
                                              style={{
                                                  minWidth: '200px',
                                                  position: 'absolute',
                                                  zIndex: '100',
                                                  top: 0,
                                                  left: 0
                                              }}>
                <CardView card={v.player1BeingPlayedCard} up={v.player1CardRevealed}/>
            </div>
            }
            <StackView cards={v.player1Cards} up={false}/>
            <div id="player1WonCards" style={{width: '143px', height: '200px', position: 'relative'}}>
                <StackView cards={v.player1WonCards} up={true}/>
            </div>
        </div>
    </>
};
