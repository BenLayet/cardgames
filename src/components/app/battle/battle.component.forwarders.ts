import type {ChildrenConfig, InternalEventForwarders} from "@softer-components/types";

import type {Contract} from "./battle.component.contract";

export const childrenConfig: ChildrenConfig<Contract> = {
    game: {
        commands: [
            {
                from: "startGameRequested",
                to: "dealRequested",
                withPayload: ({values}) =>values.cardCount()
            },
        ],
        listeners: [
            {from: "playAgainRequested", to: "goHomeRequested"}
        ]
    },
};
export const eventForwarders: InternalEventForwarders<Contract> = [
    {from: "incrementCardCountRequested", to: "cardCountIncremented", onCondition: ({values}) => values.canIncrementCardCount()},
    {from: "decrementCardCountRequested", to: "cardCountDecremented", onCondition: ({values}) => values.canDecrementCardCount()},
]