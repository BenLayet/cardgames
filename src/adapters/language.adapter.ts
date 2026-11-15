import i18n from "../i18n.ts";
import type {Language, LanguageService} from "../services/language.service.ts";

export class I18nextLanguageAdapter implements LanguageService {
    setLanguage(language: Language): void {
        i18n.changeLanguage(language).catch((error: unknown) => {
            console.error("Failed to change the language:", error);
        });
    }
}
