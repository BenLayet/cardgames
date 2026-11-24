import type {EventForwarders} from "@softer-components/types";

import type {Contract} from "./app.component.contract";

export const eventForwarders = {
    children: {
        battle: {
            listeners: [
                {from: "homeRequested", to: "homeRequested"},
            ]
        },
        spider: {
            listeners: [
                {from: "homeRequested", to: "homeRequested"},
            ]
        },
    },
} satisfies EventForwarders<Contract>;
