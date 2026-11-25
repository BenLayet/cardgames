import {useEffect, useRef} from "react";

// How deep a screen is: the home page, the menu of a game, a game in progress
export type ScreenLevel = 0 | 1 | 2;

type LevelState = { cardgamesLevel?: ScreenLevel };
const levelOf = (state: unknown): ScreenLevel => (state as LevelState | null)?.cardgamesLevel ?? 0;

// the history moves that the application makes itself, whose popstate must not go back once more
let ownMoves = 0;

// Keeps one browser history entry per screen level, so that the back gesture of Android and the back button of the
// browser go back one screen, like the back arrow of the bar
export const useHistoryLevel = (level: ScreenLevel, onBack?: () => void) => {
    const onBackRef = useRef(onBack);
    useEffect(() => {
        onBackRef.current = onBack;
    }, [onBack]);

    useEffect(() => {
        const current = levelOf(window.history.state);
        if (level > current) {
            window.history.pushState({cardgamesLevel: level} satisfies LevelState, "");
        } else if (level < current) {
            // the back arrow was used: the entries of the deeper screens are left behind
            ownMoves++;
            window.history.go(level - current);
        }
        const onPopState = (event: PopStateEvent) => {
            if (ownMoves > 0) {
                ownMoves--;
                return;
            }
            if (levelOf(event.state) < level) onBackRef.current?.();
        };
        window.addEventListener("popstate", onPopState);
        return () => window.removeEventListener("popstate", onPopState);
    }, [level]);
};
