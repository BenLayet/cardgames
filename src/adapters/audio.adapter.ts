import type {AudioService} from "../services/audio.service.ts";
import applauseSoundUrl from "../assets/audio/applause.mp3";
import crowdDisappointmentSoundUrl from "../assets/audio/crowd-disappointment.mp3";

export class AudioAdapter implements AudioService {
    private currentAudio: HTMLAudioElement | null = null;

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
