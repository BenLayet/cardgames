export interface AudioService {
    stopAll(): void;
    playApplause(): void;
    playCrowdDisappointment(): void;
    playCardSlide(): void;
    startBackgroundMusic(): void;
    stopBackgroundMusic(): void;
    setMusicEnabled(enabled: boolean): void;
    setSoundsEnabled(enabled: boolean): void;
}
