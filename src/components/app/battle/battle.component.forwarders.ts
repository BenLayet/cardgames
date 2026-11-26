import type {EventForwarders} from "@softer-components/types";

import type {Contract} from "./battle.component.contract";

export const eventForwarders = {
    children: {
        game: {
            commands: [
                {
                    from: "startGameRequested",
                    to: "dealRequested",
                    withPayload: ({values}) => ({cardCount: values.cardCount(), isPlayer2Computer: values.isPlayer2Computer(), playerNames: values.playerNames()}),
                },
                {from: "resumeRequested", to: "restoreRequested"},
            ],
            listeners: [
                {from: "playAgainRequested", to: "startGameRequested"},
                {from: "menuRequested", to: "goHomeRequested"},
                {from: "gameStarted", to: "gameSaved"},
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
