import i18n from '../i18n';

const types = ['URGENTLY', 'WITH_MASTER', 'POINT_DATE'];

export default (type, value) => {
  if (type === types[2]) {
    if (value[2]) {
      return `${value[2] < 9 ? `0${value[2]}` : value[2]}.${
        value[1] < 9 ? `0${value[1]}` : value[1]
      }.${value[0]}`;
    } else {
      const date = new Date(value);
      const builtDate = `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`;
      return builtDate;
    }
  } else {
    return i18n.t(`createOrder:${type}`);
  }
};
