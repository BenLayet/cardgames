import type {AudioService} from "../services/audio.service.ts";
import applauseSoundUrl from "../assets/audio/applause.mp3";
import crowdDisappointmentSoundUrl from "../assets/audio/crowd-disappointment.mp3";
import cardSlideSoundUrl from "../assets/audio/card-slide-1.mp3";
import backgroundMusicUrl from "../assets/audio/soft-piano-loop.mp3";

// browsers keep the sound suspended until the user has interacted with the page
const USER_GESTURE_EVENTS = ["pointerdown", "keydown", "touchend"] as const;
// gain at the loudest setting
const MAX_MUSIC_GAIN = 0.6;
const CARD_SLIDE_GAIN = 0.7;

// Plays through the Web Audio API: iOS ignores the volume of <audio> elements, not the gain of a GainNode
export class AudioAdapter implements AudioService {
    private context: AudioContext | null = null;
    private musicGain: GainNode | null = null;
    private soundsGain: GainNode | null = null;
    private readonly buffers = new Map<string, Promise<AudioBuffer>>();
    private soundsVolume = 0;
    private music: { source: AudioBufferSourceNode, startedAt: number } | null = null;
    // where the music was paused, in seconds, so that it goes on from there
    private musicOffset = 0;
    private currentSound: AudioBufferSourceNode | null = null;
    // counts the calls to stopAll(), so that a sound still loading when it was called does not start
    private stopCount = 0;

    // the music plays on every screen, so turning it up from 0 starts it right away
    setMusicVolume(volume: number): void {
        if (volume <= 0) {
            this.stopMusic();
            return;
        }
        this.graph().musicGain.gain.value = MAX_MUSIC_GAIN * volume / 100;
        this.startMusic();
    }

    setSoundsVolume(volume: number): void {
        this.soundsVolume = volume;
        if (volume <= 0) {
            this.stopAll();
            return;
        }
        this.graph().soundsGain.gain.value = volume / 100;
    }

    stopAll(): void {
        this.stopCount++;
        this.currentSound?.stop();
        this.currentSound = null;
    }

    playApplause(): void {
        this.stopAll();
        this.playSound(applauseSoundUrl, 1, source => this.currentSound = source);
    }

    playCrowdDisappointment(): void {
        this.stopAll();
        this.playSound(crowdDisappointmentSoundUrl, 1, source => this.currentSound = source);
    }

    // Short sound effect that can overlap with itself and with the other sounds
    playCardSlide(): void {
        this.playSound(cardSlideSoundUrl, CARD_SLIDE_GAIN);
    }

    private graph() {
        if (!this.context || !this.musicGain || !this.soundsGain) {
            const context = new AudioContext();
            this.musicGain = context.createGain();
            this.musicGain.connect(context.destination);
            this.soundsGain = context.createGain();
            this.soundsGain.connect(context.destination);
            this.context = context;
            // also resumes the sound after the system suspended it, such as when a phone call ends
            const resume = () => {
                if (context.state !== "running") void context.resume().catch(() => undefined);
            };
            USER_GESTURE_EVENTS.forEach(name => document.addEventListener(name, resume, true));
            resume();
        }
        return {context: this.context, musicGain: this.musicGain, soundsGain: this.soundsGain};
    }

    private load(url: string): Promise<AudioBuffer> {
        let buffer = this.buffers.get(url);
        if (!buffer) {
            const {context} = this.graph();
            buffer = fetch(url)
                .then(response => response.arrayBuffer())
                .then(data => context.decodeAudioData(data));
            // a failed download is tried again next time
            buffer.catch(() => this.buffers.delete(url));
            this.buffers.set(url, buffer);
        }
        return buffer;
    }

    // Loops forever once started, across screens; not affected by stopAll()
    private startMusic(): void {
        if (this.music) return;
        const {context, musicGain} = this.graph();
        // reserves the place, so that moving the slider does not start the music twice
        const pending = {source: context.createBufferSource(), startedAt: 0};
        this.music = pending;
        this.load(backgroundMusicUrl).then(buffer => {
            // the music was stopped while it was loading
            if (this.music !== pending) return;
            pending.source.buffer = buffer;
            pending.source.loop = true;
            pending.source.connect(musicGain);
            const offset = this.musicOffset % buffer.duration;
            pending.startedAt = context.currentTime - offset;
            pending.source.start(0, offset);
        }).catch((error: unknown) => {
            if (this.music === pending) this.music = null;
            console.error("Failed to play background music:", error);
        });
    }

    private stopMusic(): void {
        if (!this.music || !this.context) return;
        const {source, startedAt} = this.music;
        this.music = null;
        if (!source.buffer) return;
        this.musicOffset = this.context.currentTime - startedAt;
        source.stop();
    }

    private playSound(url: string, gain: number, onStart?: (source: AudioBufferSourceNode) => void): void {
        if (this.soundsVolume <= 0) return;
        const {context, soundsGain} = this.graph();
        const stopCount = this.stopCount;
        this.load(url).then(buffer => {
            if (onStart && stopCount !== this.stopCount) return;
            const source = context.createBufferSource();
            source.buffer = buffer;
            const sourceGain = context.createGain();
            sourceGain.gain.value = gain;
            source.connect(sourceGain).connect(soundsGain);
            source.start();
            onStart?.(source);
        }).catch((error: unknown) => {
            console.error(`Failed to play sound ${url}:`, error);
        });
    }
}
