import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {createPressRepeater} from "./press-repeat.ts";

describe("createPressRepeater", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });
    afterEach(() => {
        vi.useRealTimers();
    });

    it("acts once at a short press", () => {
        const act = vi.fn();
        const repeater = createPressRepeater(act, () => true, 500);
        repeater.press();
        vi.advanceTimersByTime(300);
        repeater.release();
        vi.advanceTimersByTime(2000);
        expect(act).toHaveBeenCalledTimes(1);
    });

    it("acts twice a second while held", () => {
        const act = vi.fn();
        const repeater = createPressRepeater(act, () => true, 500);
        repeater.press();
        vi.advanceTimersByTime(2000);
        expect(act).toHaveBeenCalledTimes(5);
        repeater.release();
        vi.advanceTimersByTime(2000);
        expect(act).toHaveBeenCalledTimes(5);
    });

    it("stops when the action is no longer possible", () => {
        let left = 3;
        const act = vi.fn(() => left--);
        const repeater = createPressRepeater(act, () => left > 0, 500);
        repeater.press();
        vi.advanceTimersByTime(5000);
        expect(act).toHaveBeenCalledTimes(3);
        expect(repeater.isPressed()).toBe(false);
    });

    it("does nothing when the action is not possible at the press", () => {
        const act = vi.fn();
        const repeater = createPressRepeater(act, () => false, 500);
        repeater.press();
        vi.advanceTimersByTime(2000);
        expect(act).not.toHaveBeenCalled();
    });

    it("starts again from the press when pressed twice", () => {
        const act = vi.fn();
        const repeater = createPressRepeater(act, () => true, 500);
        repeater.press();
        repeater.press();
        vi.advanceTimersByTime(500);
        expect(act).toHaveBeenCalledTimes(3);
    });
});
