import i18n from '../i18n';

export default (rating) => {
  const value = parseInt(rating, 10);

  if (value < 20) {
    return i18n.t('guide:starter');
  } else if (value >= 20 && value < 60) {
    return i18n.t('guide:specialist');
  } else if (value >= 60 && value < 80) {
    return i18n.t('guide:expert');
  } else if (value >= 80) {
    return i18n.t('guide:proffesional');
  }
};
