import type {AudioService} from "../services/audio.service.ts";
import applauseSoundUrl from "../assets/audio/applause.mp3";
import crowdDisappointmentSoundUrl from "../assets/audio/crowd-disappointment.mp3";
import cardSlideSoundUrl from "../assets/audio/card-slide-1.mp3";

export class AudioAdapter implements AudioService {
    private currentAudio: HTMLAudioElement | null = null;
    private readonly cardSlideAudio = new Audio(cardSlideSoundUrl);

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
        const audio = this.cardSlideAudio.cloneNode() as HTMLAudioElement;
        audio.volume = 0.7;
        audio.play().catch(error => {
            console.error("Failed to play card slide sound:", error);
        });
    }

    private play(soundUrl: string): void {
        // Stop any currently playing audio
        this.stopAll();

        const audio = new Audio(soundUrl);
        audio.volume = 1;
        audio.play().catch(error => {
            console.error(`Failed to play sound ${soundUrl}:`, error);
        });

        this.currentAudio = audio;
    }

}
