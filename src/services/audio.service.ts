// volumes go from 0 (off) to 100 (loudest)
export interface AudioService {
    stopAll(): void;
    playApplause(): void;
    playCrowdDisappointment(): void;
    playCardSlide(): void;
    setMusicVolume(volume: number): void;
    setSoundsVolume(volume: number): void;
}
