
const localization = (state = { locale: 'ru' }, action) => {
  switch (action.type) {
    case 'LOCALIZATION_SET':
      return {
        locale: action.payload,
      };
    default:
      return state;
  }
};

export default localization;
