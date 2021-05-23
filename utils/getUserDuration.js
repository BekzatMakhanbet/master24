import moment from 'moment';
import i18n from '../i18n';

const getMonth = (value) => {
  if (value === 0) {
    return '';
  } else if (value === 1) {
    return value + ` ${i18n.t('simple:month1')} `;
  } else if (value > 1 && value < 5) {
    return value + ` ${i18n.t('simple:month2')} `;
  } else if (value >= 5) {
    return value + ` ${i18n.t('simple:month3')} `;
  }
};

const getDay = (value) => {
  if (value === 0) {
    return '';
  } else if (value === 1) {
    return value + ` ${i18n.t('simple:day1')} `;
  } else if (value > 1 && value < 5) {
    return value + ` ${i18n.t('simple:day2')} `;
  } else if (value >= 5) {
    return value + ` ${i18n.t('simple:day3')} `;
  }
};

const getYear = (value) => {
  if (value === 0) {
    return '';
  } else if (value === 1) {
    return value + ` ${i18n.t('simple:year1')} `;
  } else if (value > 1 && value < 5) {
    return value + ` ${i18n.t('simple:year2')} `;
  } else if (value >= 5) {
    return value + ` ${i18n.t('simple:year3')} `;
  }
};

export default (timestamp) => {
  //Generate the user time in service
  const date1 = new Date();

  var a = moment(date1);
  var b = moment([timestamp[0], timestamp[1] - 1, timestamp[2] + 1]);

  var years = a.diff(b, 'year');
  b.add(years, 'years');

  var months = a.diff(b, 'months');
  b.add(months, 'months');

  var days = a.diff(b, 'days');

  let message = `${getYear(years)}${getMonth(months)}${getDay(days)}`;
  if (message.length === 0 || message === 'undefinedundefinedundefined') {
    message = i18n.t('simple:onPortalToday');
  } else {
    message = `${i18n.t('simple:onPortal')} ${message}`;
  }

  return message;
};
