import { useTranslation } from 'react-i18next';

export const LanguageSwitcher = () => {
    const { i18n } = useTranslation();

    return (
        <span className="language-switcher" style={{
            display: 'inline-flex',
            gap: '0.5rem',
        }}>
            <button
                onClick={() => i18n.changeLanguage('en')}
                className={`btn ${i18n.language === 'en' ? 'btn-primary' : 'btn-outline-primary'}`}
                style={{
                    fontSize: '1.5em',
                    padding: '0.25rem 0.5rem',
                    border: i18n.language === 'en' ? '2px solid #0d6efd' : '2px solid #6c757d',
                    cursor: 'pointer',
                    borderRadius: '4px',
                }}
                title="English"
                aria-label="Switch to English"
            >
                🇬🇧
            </button>
            <button
                onClick={() => i18n.changeLanguage('fr')}
                className={`btn ${i18n.language === 'fr' ? 'btn-primary' : 'btn-outline-primary'}`}
                style={{
                    fontSize: '1.5em',
                    padding: '0.25rem 0.5rem',
                    border: i18n.language === 'fr' ? '2px solid #0d6efd' : '2px solid #6c757d',
                    cursor: 'pointer',
                    borderRadius: '4px',
                }}
                title="Français"
                aria-label="Changer la langue en français"
            >
                🇫🇷
            </button>
        </span>
    );
};

