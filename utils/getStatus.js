import i18n from '../i18n';

const color = {
  MODERATION: 'orange',
  OPEN: 'green',
  IN_PROGRESS: 'blue',
  COMPLETED: 'red',
  CANCELLED: 'red',
  WAITING_FOR_CUSTOMER_RESPONSE: 'orange',
};

const statusText = {
  MODERATION: '',
  OPEN: i18n.t('simple:waitAnswearFromCustomer'),
  IN_PROGRESS: i18n.t('simple:alreadyInProgress'),
  COMPLETED: i18n.t('simple:alreadyFinished'),
  CANCELLED: i18n.t('simple:alreadyFinished'),
  WAITING_FOR_CUSTOMER_RESPONSE: i18n.t('simple:alreadyFinished'),
};

export default (status) => {
  return { color: color[status], text: i18n.t(`status:${status}`), statusText: statusText[status] };
};
