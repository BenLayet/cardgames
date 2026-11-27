/**
 * Repeats an action while a button is held: once at the press, then every `intervalMs`
 * until the button is released or the action is no longer possible.
 * Framework-free, so that the timing can be tested with fake timers.
 */
export type PressRepeater = {
    // the button is pressed: act at once, then keep acting
    press: () => void,
    // the button is released, the press is cancelled, or the action became impossible
    release: () => void,
    isPressed: () => boolean,
};

export function createPressRepeater(act: () => void, canAct: () => boolean, intervalMs: number): PressRepeater {
    let timer: ReturnType<typeof setInterval> | null = null;
    const release = () => {
        if (timer !== null) clearInterval(timer);
        timer = null;
    };
    const tick = () => {
        if (!canAct()) {
            release();
            return;
        }
        act();
    };
    return {
        press: () => {
            release();
            if (!canAct()) return;
            act();
            timer = setInterval(tick, intervalMs);
        },
        release,
        isPressed: () => timer !== null,
    };
}
