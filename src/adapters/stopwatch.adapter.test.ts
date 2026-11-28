import {describe, expect, it} from "vitest";

import {PageStopwatchAdapter} from "./stopwatch.adapter.ts";

const fakePage = () => {
    const listeners: (() => void)[] = [];
    return {
        hidden: false,
        addEventListener: (_: string, listener: () => void) => listeners.push(listener),
        setHidden(hidden: boolean) {
            this.hidden = hidden;
            listeners.forEach(listener => listener());
        },
    };
};

describe("stopwatch of a game", () => {
    it("counts from the time already played, and stops when paused", () => {
        let now = 1000;
        const stopwatch = new PageStopwatchAdapter(fakePage() as unknown as Document, () => now);
        stopwatch.start(5000);
        now += 2000;
        expect(stopwatch.elapsedMs()).toBe(7000);

        stopwatch.pause();
        now += 2000;
        expect(stopwatch.elapsedMs()).toBe(7000);
    });

    it("does not count while the page is hidden", () => {
        let now = 0;
        const page = fakePage();
        const stopwatch = new PageStopwatchAdapter(page as unknown as Document, () => now);
        stopwatch.start(0);
        now += 1000;
        page.setHidden(true);
        now += 60_000;
        page.setHidden(false);
        now += 1000;

        expect(stopwatch.elapsedMs()).toBe(2000);
    });

    it("stays paused when the page comes back", () => {
        let now = 0;
        const page = fakePage();
        const stopwatch = new PageStopwatchAdapter(page as unknown as Document, () => now);
        stopwatch.start(0);
        now += 1000;
        stopwatch.pause();
        page.setHidden(true);
        page.setHidden(false);
        now += 1000;

        expect(stopwatch.elapsedMs()).toBe(1000);
    });
});
