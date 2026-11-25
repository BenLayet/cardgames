import type {AudioService} from "../services/audio.service.ts";
import applauseSoundUrl from "../assets/audio/applause.mp3";
import crowdDisappointmentSoundUrl from "../assets/audio/crowd-disappointment.mp3";
import cardSlideSoundUrl from "../assets/audio/card-slide-1.mp3";
import backgroundMusicUrl from "../assets/audio/soft-piano-loop.mp3";

// browsers refuse to play sound before the user has interacted with the page
const USER_GESTURE_EVENTS = ["pointerdown", "keydown", "touchend"] as const;

export class AudioAdapter implements AudioService {
    private currentAudio: HTMLAudioElement | null = null;
    private readonly cardSlideAudio = new Audio(cardSlideSoundUrl);
    private backgroundMusic: HTMLAudioElement | null = null;
    private musicEnabled = true;
    private soundsEnabled = true;
    private waitingForUserGesture = false;

    // the music plays on every screen, so turning it on starts it right away
    setMusicEnabled(enabled: boolean): void {
        this.musicEnabled = enabled;
        if (enabled) this.startBackgroundMusic();
        else this.stopBackgroundMusic();
    }

    setSoundsEnabled(enabled: boolean): void {
        this.soundsEnabled = enabled;
        if (!enabled) this.stopAll();
    }

    // Loops forever once started, across screens; not affected by stopAll()
    private startBackgroundMusic(): void {
        if (!this.musicEnabled) return;
        if (!this.backgroundMusic) {
            const music = new Audio(backgroundMusicUrl);
            music.loop = true;
            music.volume = 0.3;
            this.backgroundMusic = music;
        }
        const music = this.backgroundMusic;
        if (!music.paused) return;
        music.play().catch((error: unknown) => {
            if (error instanceof DOMException && error.name === "NotAllowedError") this.retryAtUserGesture();
            else console.error("Failed to play background music:", error);
        });
    }

    private stopBackgroundMusic(): void {
        this.backgroundMusic?.pause();
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

    private retryAtUserGesture(): void {
        if (this.waitingForUserGesture) return;
        this.waitingForUserGesture = true;
        const retry = () => {
            this.waitingForUserGesture = false;
            USER_GESTURE_EVENTS.forEach(name => document.removeEventListener(name, retry, true));
            this.startBackgroundMusic();
        };
        USER_GESTURE_EVENTS.forEach(name => document.addEventListener(name, retry, true));
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
