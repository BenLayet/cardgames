import type {ChildrenConfig} from "@softer-components/types";

import type {Contract} from "./battle.component.contract";

export const childrenConfig: ChildrenConfig<Contract> = {
    game: {
        commands: [
            {
                from: "startGameRequested",
                to: "dealRequested",
                withPayload: ({values}) => values.cardCount()
            },
        ],
        listeners: [
            {from: "playAgainRequested", to: "goHomeRequested"}
        ]
    },
    startScreen: {
        listeners: [
            {from: "startGameRequested", to: "startGameRequested"},]
    }
};
