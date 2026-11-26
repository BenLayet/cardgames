import {AudioAdapter} from "./adapters/audio.adapter.ts";
import {LocalStorageSettingsAdapter} from "./adapters/settings.adapter.ts";
import {TimeoutSchedulerAdapter} from "./adapters/scheduler.adapter.ts";
import {I18nextLanguageAdapter} from "./adapters/language.adapter.ts";
import {LocalStorageSpiderSaveAdapter} from "./adapters/spider-save.adapter.ts";
import {LocalStorageBattleSaveAdapter} from "./adapters/battle-save.adapter.ts";
import {registerSW} from "virtual:pwa-register";
import {PwaAppUpdateAdapter} from "./adapters/app-update.adapter.ts";
import {initI18n} from "./i18n.ts";
import {toLanguage} from "./services/language.service.ts";

const settingsService = new LocalStorageSettingsAdapter();
const audioService = new AudioAdapter();
const schedulerService = new TimeoutSchedulerAdapter();
const languageService = new I18nextLanguageAdapter();
const spiderSaveService = new LocalStorageSpiderSaveAdapter();
const battleSaveService = new LocalStorageBattleSaveAdapter();
// the views of the application ask it directly, outside the state of the games
export const appUpdateService = new PwaAppUpdateAdapter(registerSW);
appUpdateService.watchForeground(document);

const {musicVolume, soundsVolume, language} = settingsService.load();
audioService.setMusicVolume(musicVolume);
audioService.setSoundsVolume(soundsVolume);
void initI18n(toLanguage(language));

export const configuration = {
    audioService,
    settingsService,
    schedulerService,
    languageService,
    spiderSaveService,
    battleSaveService,
}
