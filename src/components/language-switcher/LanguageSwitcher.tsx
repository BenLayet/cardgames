import { useTranslation } from 'react-i18next';

export const LanguageSwitcher = () => {
    const { i18n } = useTranslation();

    return (
        <span className="d-inline-flex gap-2">
            <button
                onClick={() => i18n.changeLanguage('en')}
                className={`btn ${i18n.language === 'en' ? 'btn-primary' : 'btn-outline-primary'}`}
                title="English"
                aria-label="Switch to English"
            >
                🇬🇧
            </button>
            <button
                onClick={() => i18n.changeLanguage('fr')}
                className={`btn ${i18n.language === 'fr' ? 'btn-primary' : 'btn-outline-primary'}`}
                title="Français"
                aria-label="Changer la langue en français"
            >
                🇫🇷
            </button>
        </span>
    );
};

