import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import localizations from './localizations';
import Expo from 'expo';

const DEFAULT_LOCALIZATION = 'ru';

export const syncLocalizationWithStore = (store) => {
  i18n.changeLanguage(store.getState().localReducer.locale || DEFAULT_LOCALIZATION);
};

const languageDetector = {
  type: 'languageDetector',
  async: true, // async detection
  detect: (cb) => {
    return Expo.Util.getCurrentLocaleAsync().then((lng) => {
      cb(lng.replace('_', '-'));
    });
  },
  init: () => {},
  cacheUserLanguage: () => {},
};

i18n
  .use(initReactI18next)
  .use(languageDetector)
  .init({
    resources: localizations,
    lng: DEFAULT_LOCALIZATION,
    fallbackLng: DEFAULT_LOCALIZATION,
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
