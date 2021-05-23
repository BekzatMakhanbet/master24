import i18n from '../i18n';

const types = ['FIXED', 'UP_TO', 'CONTRACTUAL'];

export default (type, value) => {
  if (type === types[2]) {
    return i18n.t(`createOrder:${type}`);
  } else if (type === types[0]) {
    return value;
  } else if (type === types[1]) {
    return `${i18n.t(`createOrder:${type}`)}: ${value}`;
  }
};
