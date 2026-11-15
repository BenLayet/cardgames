export interface SchedulerService {
    // runs the callback once the delay has passed, unless cancelAll() is called before
    schedule(callback: () => void, delayMs: number): void;
    cancelAll(): void;
}
