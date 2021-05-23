import axios from 'axios';
import config from '../config/config';

const sendPushNotification = (
  body,
  bodyKz,
  title,
  titleKz,
  userId,
  screen,
  itemId,
  mode,
  type,
  clientModal,
  masterModal,
  clientId,
  masterId,
) => {
  const pushBody = {
    userIds: [userId],
    title,
    channelId: 'chat-messages',
    body,
    data: {
      additionalProp1: {
        screen,
        title,
        body,
        titleKz,
        bodyKz,
        type,
        mode,
      },
      additionalProp2: { itemId, clientModal, masterModal, clientId, masterId },
    },
  };

  axios
    .post(`${config.url}/api/v1/push`, pushBody, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .catch((err) => {
      console.log(JSON.stringify(err));
    });
};

export default sendPushNotification;
