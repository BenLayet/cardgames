import type {AudioService} from "../services/audio.service.ts";
import applauseSoundUrl from "../assets/audio/applause.mp3";

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
        // Stop any currently playing audio
        this.stopAll();

        // Create new audio element
        const audio = new Audio(applauseSoundUrl);
        audio.volume =1;
        audio.play().catch(error => {
            console.error("Failed to play applause sound:", error);
        });

        this.currentAudio = audio;
    }

}