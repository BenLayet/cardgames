import {type KeyboardEvent, type MouseEvent, type PointerEvent, useEffect, useRef} from "react";
import {createPressRepeater, type PressRepeater} from "./press-repeat.ts";

/**
 * The props of a button that repeats its action while it is held, with touch or mouse:
 * once at the press, then every `intervalMs` until released or until `enabled` turns false.
 * A click from the keyboard (Enter, Space) acts once. A long press opens no context menu.
 */
export function usePressRepeat(action: () => void, enabled: boolean, intervalMs: number) {
    const latest = useRef({action, enabled});
    useEffect(() => {
        latest.current = {action, enabled};
    });
    const repeater = useRef<PressRepeater | null>(null);
    // the click that follows a pointer press must not act a second time
    const pressedByPointer = useRef(false);
    useEffect(() => {
        repeater.current = createPressRepeater(() => latest.current.action(), () => latest.current.enabled, intervalMs);
        return () => repeater.current?.release();
    }, [intervalMs]);
    useEffect(() => {
        if (!enabled) repeater.current?.release();
    }, [enabled]);

    const release = () => repeater.current?.release();
    return {
        onPointerDown: (event: PointerEvent<HTMLButtonElement>) => {
            if (event.pointerType === "mouse" && event.button !== 0) return;
            // the button keeps the pointer: a finger that slides a little does not stop the press
            event.currentTarget.setPointerCapture(event.pointerId);
            pressedByPointer.current = true;
            repeater.current?.press();
        },
        onPointerUp: release,
        onPointerCancel: release,
        onLostPointerCapture: release,
        onClick: (event: MouseEvent<HTMLButtonElement>) => {
            if (pressedByPointer.current) {
                pressedByPointer.current = false;
                return;
            }
            event.preventDefault();
            if (latest.current.enabled) latest.current.action();
        },
        onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => {
            if (event.key === "Enter" || event.key === " ") pressedByPointer.current = false;
        },
        onContextMenu: (event: MouseEvent<HTMLButtonElement>) => event.preventDefault(),
    };
}
