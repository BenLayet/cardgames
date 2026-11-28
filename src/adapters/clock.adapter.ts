import type {ClockService} from "../services/clock.service.ts";

export class BrowserClockAdapter implements ClockService {
    now = () => Date.now();
}
