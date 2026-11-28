// Measures the time a game is played: only while it is on screen
export interface StopwatchService {
    // starts again from the time already played
    start(elapsedMs: number): void;
    pause(): void;
    elapsedMs(): number;
}
