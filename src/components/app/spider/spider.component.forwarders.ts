import type {EventForwarders} from "@softer-components/types";

import type {Contract} from "./spider.component.contract";

export const eventForwarders = {
    children: {
        game: {
            commands: [
                {
                    from: "startGameRequested",
                    to: "dealRequested",
                    withPayload: ({values}) => ({suitCount: values.suitCount()}),
                },
                {from: "resumeRequested", to: "restoreRequested"},
            ],
            listeners: [
                {from: "playAgainRequested", to: "goHomeRequested"},
                {from: "gameEnded", to: "gameFinished"},
            ]
        },
        setup: {
            listeners: [
                {from: "startGameRequested", to: "startGameRequested"},
                {from: "backRequested", to: "homeRequested"},
            ]
        }
    },
} satisfies EventForwarders<Contract>;
