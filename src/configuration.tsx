import {AudioAdapter} from "./adapters/audio.adapter.ts";
import {LocalStorageSettingsAdapter} from "./adapters/settings.adapter.ts";
import {TimeoutSchedulerAdapter} from "./adapters/scheduler.adapter.ts";
import {I18nextLanguageAdapter} from "./adapters/language.adapter.ts";
import {LocalStorageSpiderSaveAdapter} from "./adapters/spider-save.adapter.ts";
import {initI18n} from "./i18n.ts";
import {toLanguage} from "./services/language.service.ts";

const settingsService = new LocalStorageSettingsAdapter();
const audioService = new AudioAdapter();
const schedulerService = new TimeoutSchedulerAdapter();
const languageService = new I18nextLanguageAdapter();
const spiderSaveService = new LocalStorageSpiderSaveAdapter();

const {musicEnabled, soundsEnabled, language} = settingsService.load();
audioService.setMusicEnabled(musicEnabled);
audioService.setSoundsEnabled(soundsEnabled);
void initI18n(toLanguage(language));

export const configuration = {
    audioService,
    settingsService,
    schedulerService,
    languageService,
    spiderSaveService,
}
