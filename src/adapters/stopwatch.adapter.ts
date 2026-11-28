import type {StopwatchService} from "../services/stopwatch.service.ts";

type Page = Pick<Document, "hidden" | "addEventListener">;

// Counts the time while the page is shown: it stops when the application goes to the background, and goes on
// when it comes back, as long as it was not paused
export class PageStopwatchAdapter implements StopwatchService {
    private counted = 0;
    // when the time counted last started, null while it does not run
    private since: number | null = null;
    private isRunning = false;
    private readonly page: Page | null;
    private readonly clock: () => number;

    constructor(page: Page | null = typeof document === "undefined" ? null : document, clock: () => number = () => performance.now()) {
        this.page = page;
        this.clock = clock;
        page?.addEventListener("visibilitychange", () => {
            if (page.hidden) this.stopCounting();
            else if (this.isRunning) this.since = this.clock();
        });
    }

    start(elapsedMs: number): void {
        this.counted = elapsedMs;
        this.isRunning = true;
        this.since = this.page?.hidden ? null : this.clock();
    }

    pause(): void {
        this.stopCounting();
        this.isRunning = false;
    }

    elapsedMs(): number {
        return Math.round(this.counted + (this.since === null ? 0 : this.clock() - this.since));
    }

    private stopCounting() {
        this.counted = this.elapsedMs();
        this.since = null;
    }
}
