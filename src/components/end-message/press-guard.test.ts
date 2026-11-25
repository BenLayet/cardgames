import {describe, expect, it} from "vitest";

import {pressGuard} from "./press-guard.ts";

describe("the end message", () => {
    it("ignores the click that follows the tap which ended the game", () => {
        // the press of the winning tap was on a card, the message appeared before its click
        const guard = pressGuard();

        expect(guard.clicked()).toBe(false);
    });

    it("starts a new game when it is tapped", () => {
        const guard = pressGuard();

        guard.pressed();

        expect(guard.clicked()).toBe(true);
    });

    it("needs a new press for each click", () => {
        const guard = pressGuard();
        guard.pressed();
        guard.clicked();

        expect(guard.clicked()).toBe(false);
    });
});
