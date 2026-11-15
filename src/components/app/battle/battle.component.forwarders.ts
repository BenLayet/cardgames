import type {EventForwarders} from "@softer-components/types";

import type {Contract} from "./battle.component.contract";

export const eventForwarders = {
    children: {
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
    },
} satisfies EventForwarders<Contract>;
