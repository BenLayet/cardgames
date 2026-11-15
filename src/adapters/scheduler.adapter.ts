import type {SchedulerService} from "../services/scheduler.service.ts";

export class TimeoutSchedulerAdapter implements SchedulerService {
    private readonly pendingTimeouts = new Set<ReturnType<typeof setTimeout>>();

    schedule(callback: () => void, delayMs: number): void {
        const timeout = setTimeout(() => {
            this.pendingTimeouts.delete(timeout);
            callback();
        }, delayMs);
        this.pendingTimeouts.add(timeout);
    }

    cancelAll(): void {
        this.pendingTimeouts.forEach(clearTimeout);
        this.pendingTimeouts.clear();
    }
}
