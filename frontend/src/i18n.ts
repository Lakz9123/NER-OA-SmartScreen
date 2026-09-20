import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import hi from './locales/hi.json';
import asLocale from './locales/as.json';
import mni from './locales/mni.json';

const resources = {
  en: { translation: en },
  hi: { translation: hi },
  as: { translation: asLocale },
  mni: { translation: mni },
};

const savedLanguage = localStorage.getItem('app_language') || 'en';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
