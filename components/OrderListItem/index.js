import React from 'react';
import { View, Text, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { Avatar } from 'react-native-elements';
import { useNavigation } from 'react-navigation-hooks';
import { FontAwesome } from '@expo/vector-icons';
import getOrderDate from '../../utils/getOrderDate';
import getOrderPrice from '../../utils/getOrderPrice';
import getNamesLocal from '../../utils/getNamesLocal';
import getStatus from '../../utils/getStatus';
import getFontSize from '../../utils/getFontSize';
import config from '../../config/config';
import stylesObject from '../../constants/style/stylesObject';
import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export default ({ order, navigateScreen }) => {
  const navigation = useNavigation();

  const navigate = () => {
    navigation.navigate(navigateScreen, { itemId: order.id });
  };

  return order?.status ? (
    <TouchableWithoutFeedback onPress={navigate}>
      <View style={styles.orderWrapper} key={order.id}>
        <View style={styles.orderContainer}>
          <View style={styles.avatarWrapper}>
            <View style={styles.orderPerson}>
              <Avatar
                rounded
                size="large"
                icon={{ name: 'user', type: 'font-awesome' }}
                activeOpacity={0.7}
                containerStyle={styles.avatarContainer}
                source={
                  order.customer.avatar && {
                    uri: `${config.urlImage}${order.customer.avatar.imageName}`,
                  }
                }
              />
              <Text allowFontScaling={false} style={styles.customerName}>
                {order.customer.firstName}
              </Text>
            </View>
          </View>
          <View style={styles.orderText}>
            <Text allowFontScaling={false} style={styles.description}>
              {order?.description?.length > 45
                ? `${order.description.substring(0, 45)}...`
                : order.description}
            </Text>
            <View>
              <View style={{}}>
                <Text allowFontScaling={false} style={styles.specTitle}>
                  Специализация:
                </Text>
                <Text allowFontScaling={false} style={styles.specilization}>
                  {getNamesLocal(order.specialization.specName, order.specialization.specNameKz)}
                </Text>
              </View>
            </View>
            <View style={styles.orderInformationView}>
              <View style={stylesObject.defaultFlexRowCentered}>
                <FontAwesome name="clock-o" color={'#c20021'} size={getFontSize(18)} />
                <Text allowFontScaling={false} style={styles.orderPriceDateText}>
                  {' '}
                  {getOrderDate(order.urgency, order.urgencyDate)}
                </Text>
              </View>
              <View style={stylesObject.defaultFlexRowCentered}>
                <Text allowFontScaling={false} style={styles.tengeIcon}>
                  ₸{' '}
                </Text>
                <Text allowFontScaling={false} style={styles.orderPriceDateText}>
                  {getOrderPrice(order.orderPriceType, order.price)}
                </Text>
              </View>
              <Text allowFontScaling={false} style={styles.statusText}>
                Статус
              </Text>
            </View>
            <View style={styles.statusWrapper}>
              <View>
                <Text
                  allowFontScaling={false}
                  style={[
                    {
                      color: order.status ? getStatus(order?.status).color : '',
                      borderColor: order.status ? getStatus(order?.status).color : '',
                    },
                    styles.statusComponent,
                  ]}
                >
                  {order.status ? getStatus(order?.status).text : ''}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  ) : null;
};

const styles = StyleSheet.create({
  orderContainer: {
    width: '95%',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexDirection: 'row',
    marginVertical: 5,
    paddingHorizontal: 15,
    paddingBottom: 15,
    marginLeft: '2.5%',
    paddingTop: 15,
    borderRadius: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,

    elevation: 3,
  },
  avatarWrapper: { flex: 1, justifyContent: 'center' },
  orderPerson: {
    width: '110%',
    // justifyContent:'center',
    alignItems: 'center',
  },
  specilization: {
    fontWeight: '500',
    fontSize: 13,
  },
  specTitle: { fontSize: 12, color: '#c1c3c7' },
  orderText: {
    width: '70%',
    paddingLeft: 12,
  },
  avatarContainer: { flex: 2, justifyContent: 'center' },
  customerName: {
    color: '#c20021',
    fontWeight: '500',
    textAlign: 'center',
  },
  description: {
    color: 'black',
    fontWeight: '500',
    fontSize: 15,
  },
  orderInformationView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  orderPriceDateText: {
    color: 'black',
    fontWeight: '500',
    fontSize: getFontSize(14),
  },
  tengeIcon: {
    color: '#c20021',
    fontSize: getFontSize(18),
    fontWeight: '500',
    lineHeight: getFontSize(23),
  },
  statusText: { color: '#c1c3c7', fontSize: getFontSize(15) },
  statusComponent: {
    borderRadius: 5,
    padding: 5,
    fontSize: 12,
    paddingVertical: 2,
    borderWidth: 1,
  },
  orderWrapper: { flex: 1, width },
  statusWrapper: { flexDirection: 'row', justifyContent: 'flex-end' },
});
