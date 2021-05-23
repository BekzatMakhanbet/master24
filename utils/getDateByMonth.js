import moment from 'moment';
import i18n from '../i18n';
import { store } from '../store';

const months = [
  { ru: 'Января', kz: 'Қаңтар' },
  { ru: 'Февраля', kz: 'Ақпан' },
  { ru: 'Марта', kz: 'Наурыз' },
  { ru: 'Апреля', kz: 'Сәуір' },
  { ru: 'Мая', kz: 'Мамыр' },
  { ru: 'Июня', kz: 'Маусым' },
  { ru: 'Июля', kz: 'Шілде' },
  { ru: 'Августа', kz: 'Тамыз' },
  { ru: 'Сентября', kz: 'Қыркүйек' },
  { ru: 'Октября', kz: 'Қазан' },
  { ru: 'Ноября', kz: 'Қараша' },
  { ru: 'Декабря', kz: 'Желтоқсан' },
];

export default (date) => {
  const now = moment();

  const { locale } = store.getState().localReducer;
  // Generate the date info by locale language from data array [YYYY,MM,DD,HH,MM,ss]
  if (date) {
    if (date[0] < now.year()) {
      return ` ${date[2]} ${months[date[1] - 1][locale]} ${date[0]} г.`;
    } else if (date[1] - 1 < now.month()) {
      return ` ${date[2]} ${months[date[1] - 1][locale]}`;
    } else if (date[2] < now.date()) {
      return ` ${date[2]} ${months[date[1] - 1][locale]} ${date[3]}:${
        date[4] > 9 ? date[4] : `0${date[4]}`
      }`;
    } else if (date[3] < now.hour()) {
      return ` ${i18n.t('simple:today')} ${date[3]}:${date[4] > 9 ? date[4] : `0${date[4]}`}`;
    } else if (date[3] === now.hour()) {
      return ` ${i18n.t('simple:today')} ${date[3]}:${date[4] > 9 ? date[4] : `0${date[4]}`}`;
    }
  } else {
    return 'Неизвестно';
  }
};
