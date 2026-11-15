import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslation from './locales/en/translation.json';
import frTranslation from './locales/fr/translation.json';
import {DEFAULT_LANGUAGE, type Language} from './services/language.service.ts';

export const resources = {
  en: {
    translation: enTranslation,
  },
  fr: {
    translation: frTranslation,
  },
} as const satisfies Record<Language, unknown>;

export const initI18n = (language: Language) => i18n.use(initReactI18next).init({
  resources,
  lng: language,
  fallbackLng: DEFAULT_LANGUAGE,
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
