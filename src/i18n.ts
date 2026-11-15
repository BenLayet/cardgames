import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslation from './locales/en/translation.json';
import frTranslation from './locales/fr/translation.json';
import {LocalStorageSettingsAdapter} from './adapters/settings.adapter.ts';

export const resources = {
  en: {
    translation: enTranslation,
  },
  fr: {
    translation: frTranslation,
  },
} as const;

const settingsService = new LocalStorageSettingsAdapter();

i18n.use(initReactI18next).init({
  resources,
  lng: settingsService.load().language ?? 'fr',
  fallbackLng: 'fr',
  interpolation: {
    escapeValue: false,
  },
});

i18n.on('languageChanged', (language) => settingsService.save({language}));

export default i18n;

