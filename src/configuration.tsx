import {AudioAdapter} from "./adapters/audio.adapter.ts";
import {LocalStorageSettingsAdapter} from "./adapters/settings.adapter.ts";

const settingsService = new LocalStorageSettingsAdapter();
const audioService = new AudioAdapter();
const {musicEnabled, soundsEnabled} = settingsService.load();
audioService.setMusicEnabled(musicEnabled);
audioService.setSoundsEnabled(soundsEnabled);

export const configuration = {
    audioService,
    settingsService,
}
