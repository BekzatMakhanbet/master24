import React from 'react';
import OrderListItem from '../OrderListItem';
import { View } from 'react-native';
import { MasterMessages } from './MasterMessages';
import getOrderDate from '../../utils/getOrderDate';

export default ({ respond, navigateScreen }) => {
  const { order, communicationHistoryInfos } = respond;
  return (
    <View style={{ width: '90%' }}>
      {order && <OrderListItem order={order} navigateScreen={navigateScreen} />}
      <MasterMessages
        histories={communicationHistoryInfos}
        statusText={order?.status ? getOrderDate(order.status).statusText : ''}
      />
    </View>
  );
};
