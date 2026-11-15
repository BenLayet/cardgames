import {AudioAdapter} from "./adapters/audio.adapter.ts";
import {LocalStorageSettingsAdapter} from "./adapters/settings.adapter.ts";
import {TimeoutSchedulerAdapter} from "./adapters/scheduler.adapter.ts";

const settingsService = new LocalStorageSettingsAdapter();
const audioService = new AudioAdapter();
const schedulerService = new TimeoutSchedulerAdapter();
const {musicEnabled, soundsEnabled} = settingsService.load();
audioService.setMusicEnabled(musicEnabled);
audioService.setSoundsEnabled(soundsEnabled);

export const configuration = {
    audioService,
    settingsService,
    schedulerService,
}
