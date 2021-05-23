import Axios from 'axios';
import config from '../config/config';
import { store } from '../store';

const userTypes = ['PROFILE', 'PHONE', 'PRODUCT'];
const promoTypes = ['BANNER', 'BANNER_FOLLOW', 'SIDE', 'SIDE_FOLLOW'];

export default (type, id) => {
  console.log(type);

  const body = {
    viewType: type,
    userId: store.getState().authReducer.id,
  };

  if (userTypes.includes(type)) {
    body.marketId = id;
  } else if (promoTypes.includes(type)) {
    body.promoId = id;
  } else {
    return;
  }
  console.log(body);

  Axios.post(`${config.url}/api/v1/view`, body)
    .then((res) => console.log('Отправлено'))
    .catch(() => console.log('Ошибка'));
};
