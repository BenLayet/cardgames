import type {InternalEventForwarders} from "@softer-components/types";

import type {Contract} from "./game.component.contract.ts";

export const eventForwarders: InternalEventForwarders<Contract> = [
    {from: "player1Played", to: "player2Played"},
    {from: "moveCompleted", to: "player1WonRound",
        onCondition: ({values}) => values.hasPlayer1WonRound()
    },
    {from: "moveCompleted", to: "player2WonRound",
        onCondition: ({values}) => values.hasPlayer2WonRound()
    },
];