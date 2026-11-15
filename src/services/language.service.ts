export const LANGUAGES = ["fr", "en"] as const;
export type Language = (typeof LANGUAGES)[number];
export const DEFAULT_LANGUAGE: Language = "fr";

export const isLanguage = (language: string | null): language is Language =>
    LANGUAGES.some(supported => supported === language);
// a stored language may be missing or no longer supported
export const toLanguage = (language: string | null): Language => isLanguage(language) ? language : DEFAULT_LANGUAGE;

export interface LanguageService {
    setLanguage(language: Language): void;
}
