import React, { Fragment, useState } from 'react';
import { TouchableOpacity, ScrollView, Text } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import stylesObject from '../../constants/style/stylesObject';
import { Modal } from 'react-native';
import { MasterGuide } from './guides/MasterGuide';
import { OrdersListGuide } from './guides/OrdersListGuide';
import { ProfileGuide } from './guides/ProfileGuide';
import { Button } from 'native-base';
import styles from './styles';
import { connect } from 'react-redux';
import { MyOrdersGuide } from './guides/MyOrdersGuide';
import { useTranslation } from 'react-i18next';

const components = {
  Profile: <ProfileGuide />,
  Master: <MasterGuide />,
  OrderList: <OrdersListGuide />,
  MyOrders: <MyOrdersGuide />,
};

const Guides = ({ screenName, modeReducer }) => {
  const [visible, setVisible] = useState(false);
  const { t } = useTranslation();

  return (
    <Fragment>
      <TouchableOpacity onPress={() => setVisible(true)} style={stylesObject.paddingRight15}>
        <AntDesign size={24} name={'questioncircleo'} color="white" />
      </TouchableOpacity>
      <Modal visible={visible}>
        <ScrollView contentContainerStyle={styles.contentStyle}>
          {components[screenName]}
          <Button
            style={modeReducer.mode === 'client' ? styles.buttonClient : styles.buttonMaster}
            onPress={() => setVisible(false)}
          >
            <Text style={styles.buttonText}>{t('simple:close')}</Text>
          </Button>
        </ScrollView>
      </Modal>
    </Fragment>
  );
};

export default connect(({ modeReducer }) => ({ modeReducer }), {})(Guides);
