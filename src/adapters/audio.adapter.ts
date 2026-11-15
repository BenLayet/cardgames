import type {AudioService} from "../services/audio.service.ts";
import applauseSoundUrl from "../assets/audio/applause.mp3";
import crowdDisappointmentSoundUrl from "../assets/audio/crowd-disappointment.mp3";
import cardSlideSoundUrl from "../assets/audio/card-slide-1.mp3";
import backgroundMusicUrl from "../assets/audio/soft-piano-loop.mp3";

export class AudioAdapter implements AudioService {
    private currentAudio: HTMLAudioElement | null = null;
    private readonly cardSlideAudio = new Audio(cardSlideSoundUrl);
    private backgroundMusic: HTMLAudioElement | null = null;
    private musicEnabled = true;
    private soundsEnabled = true;

    setMusicEnabled(enabled: boolean): void {
        this.musicEnabled = enabled;
        if (!enabled) this.stopBackgroundMusic();
    }

    setSoundsEnabled(enabled: boolean): void {
        this.soundsEnabled = enabled;
        if (!enabled) this.stopAll();
    }

    // Loops forever once started; not affected by stopAll()
    startBackgroundMusic(): void {
        if (!this.musicEnabled || this.backgroundMusic) return;
        const music = new Audio(backgroundMusicUrl);
        music.loop = true;
        music.volume = 0.3;
        this.backgroundMusic = music;
        music.play().catch((error: unknown) => {
            // allow a retry at the next game start
            this.backgroundMusic = null;
            console.error("Failed to play background music:", error);
        });
    }

    stopBackgroundMusic(): void {
        if (!this.backgroundMusic) return;
        this.backgroundMusic.pause();
        this.backgroundMusic = null;
    }

    stopAll(): void {
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio.currentTime = 0;
            this.currentAudio = null;
        }
    }

    playApplause(): void {
        this.play(applauseSoundUrl);
    }

    playCrowdDisappointment(): void {
        this.play(crowdDisappointmentSoundUrl);
    }

    // Short sound effect that can overlap with itself and with the other sounds
    playCardSlide(): void {
        if (!this.soundsEnabled) return;
        const audio = this.cardSlideAudio.cloneNode() as HTMLAudioElement;
        audio.volume = 0.7;
        audio.play().catch((error: unknown) => {
            console.error("Failed to play card slide sound:", error);
        });
    }

    private play(soundUrl: string): void {
        // Stop any currently playing audio
        this.stopAll();
        if (!this.soundsEnabled) return;

        const audio = new Audio(soundUrl);
        audio.volume = 1;
        audio.play().catch((error: unknown) => {
            console.error(`Failed to play sound ${soundUrl}:`, error);
        });

        this.currentAudio = audio;
    }

}
