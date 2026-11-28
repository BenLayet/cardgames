// The time of day, for what is dated
export interface ClockService {
    // milliseconds since 1970
    now(): number;
}
