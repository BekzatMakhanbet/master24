import { store } from '../store';

const getNamesLocal = (ru, kz) => {
  const { locale } = store.getState().localReducer;
  return locale === 'ru' ? ru : kz;
};

export default getNamesLocal;
