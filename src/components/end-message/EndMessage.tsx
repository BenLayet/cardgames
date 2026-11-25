import {type ReactNode, useState} from "react";

import {pressGuard} from "./press-guard.ts";

// The message at the end of a game; a tap on it starts a new game
export const EndMessage = ({onPlayAgain, children}: { onPlayAgain: () => void, children: ReactNode }) => {
    const [guard] = useState(pressGuard);
    return <div className="end-message-overlay"
                onPointerDown={guard.pressed}
                onClick={() => {
                    if (guard.clicked()) onPlayAgain();
                }}>
        {children}
    </div>;
};
