export interface AudioService {
    stopAll(): void;
    playApplause(): void;
    playCrowdDisappointment(): void;
    playCardSlide(): void;
    setMusicEnabled(enabled: boolean): void;
    setSoundsEnabled(enabled: boolean): void;
}
