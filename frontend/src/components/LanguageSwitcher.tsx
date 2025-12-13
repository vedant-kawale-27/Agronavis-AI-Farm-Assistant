import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from '../styles/LanguageSwitcher.module.css';

const LanguageSwitcher: React.FC = () => {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'en', name: t('language.english'), flag: '🇺🇸' },
    { code: 'hi', name: t('language.hindi'), flag: '🇮🇳' },
    { code: 'bn', name: t('language.bengali'), flag: '🇧🇩' }
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    setIsOpen(false);
    localStorage.setItem('selectedLanguage', languageCode);
  };

  return (
    <div className={styles.languageSwitcher}>
      <button 
        className={styles.languageButton}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={t('language.selectLanguage')}
      >
        <span className={styles.flag}>{currentLanguage.flag}</span>
        <span className={styles.languageName}>{currentLanguage.name}</span>
        <span className={styles.arrow}>{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownContent}>
            {languages.map((language) => (
              <button
                key={language.code}
                className={`${styles.dropdownItem} ${
                  i18n.language === language.code ? styles.active : ''
                }`}
                onClick={() => handleLanguageChange(language.code)}
              >
                <span className={styles.flag}>{language.flag}</span>
                <span className={styles.languageName}>{language.name}</span>
                {i18n.language === language.code && (
                  <span className={styles.checkmark}>✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;