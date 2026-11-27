// volumes go from 0 (off) to 100 (loudest)
export interface AudioService {
    stopAll(): void;
    playApplause(): void;
    playCrowdDisappointment(): void;
    playCardSlide(): void;
    // a short cheer for a small win: a completed Spider sequence, a Bataille round
    playCheer(): void;
    setMusicVolume(volume: number): void;
    setSoundsVolume(volume: number): void;
}
