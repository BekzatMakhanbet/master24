/* eslint-disable no-undef */
import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import Axios from 'axios';
import { Badge, Button } from 'native-base';
import React, { useEffect, useState } from 'react';
import { Dimensions, Modal, StyleSheet, Text, View } from 'react-native';
import { Avatar, Image } from 'react-native-elements';
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import ImageView from 'react-native-image-view';
import MapView, { Marker } from 'react-native-maps';
import RadioForm, {
  RadioButton,
  RadioButtonInput,
  RadioButtonLabel,
} from 'react-native-simple-radio-button';
import getCommunicationType from '../../utils/getCommunicationType';
import getDateByMonth from '../../utils/getDateByMonth';
import getLastOnline from '../../utils/getLastOnline';
import getOrderDate from '../../utils/getOrderDate';
import getOrderPrice from '../../utils/getOrderPrice';
import getStatus from '../../utils/getStatus';
import increaseViewCount from '../../utils/increaseViewCount';
import config from '../../config/config';

const { height } = Dimensions.get('window');

const OrderComponent = ({
  item,
  client,
  cancelOrder,
  navigateToEdit,
  t,
  finishOrder,
  reopenOrder,
  notShowReopen,
  navigation,
  cityId,
}) => {
  const [imageIndex, setImageIndex] = useState(0);
  const [cancellationReason, setCancellationReason] = useState('NOT_ACTUAL');
  const [cancelOrderModalVisible, setCancelOrderModalVisible] = useState(false);
  const [visibleImage, setVisibleImage] = useState(false);
  const [showMap, setShowMap] = useState(false);

  const [promo, setPromo] = useState(null);

  useEffect(() => {
    Axios.get(`http://91.201.215.45:49153/api/v1/promo/order?count=1&city=${cityId}`).then(
      (res) => {
        setPromo(res.data[0]);
      },
    );
  }, [cityId]);

  const { images } = item;
  if (images) {
    for (let i = 0; i < images.length; i++) {
      images[i].source = { uri: `${config.url}/images/${images[i].imageName}` };
    }
  }

  openImage = (index) => {
    setImageIndex(index);
    setVisibleImage(true);
  };

  okCancelOrder = () => {
    setCancelOrderModalVisible(false);
    cancelOrder(item.id, cancellationReason);
  };

  var radio_props = [
    { label: t('order:orderBecomeNotActual'), value: 'NOT_ACTUAL' },
    {
      label: t('order:notFoundMaster'),
      value: 'NOT_FOUND_MASTER',
    },
    {
      label: t('order:foundWithAnotherService'),
      value: 'FOUND_FROM_ANOTHER_SOURCE',
    },
    { label: t('order:another'), value: 'OTHER' },
  ];

  return (
    <View style={{ flex: 1, width: '100%' }}>
      <ScrollView
        style={{
          width: '100%',
          height:
            notShowReopen === undefined && item.status === 'WAITING_FOR_CUSTOMER_RESPONSE'
              ? '100%'
              : '80%',
        }}
        contentContainerStyle={{ justifyContent: 'flex-start', flexGrow: 1 }}
      >
        <View>
          <View style={{ backgroundColor: '#e9f0f4', paddingHorizontal: '5%' }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                flexWrap: 'nowrap',
                paddingVertical: 10,
              }}
            >
              <Text
                allowFontScaling={false}
                style={{ width: '45%', fontSize: 17, fontWeight: '400' }}
              >
                {t('order:order') + ' №' + item.id}
              </Text>
              <Text allowFontScaling={false} style={styles.icons}>
                <MaterialCommunityIcons
                  style={{ marginRight: 5 }}
                  name="eye"
                  size={16}
                  color="#b2bdbf"
                />{' '}
                <Text allowFontScaling={false} style={styles.iconText}>
                  {client
                    ? item.orderViewCount
                      ? item.orderViewCount
                      : 0 + item.viewCount
                      ? item.viewCount
                      : 0
                    : item.viewCount
                    ? item.viewCount
                    : 0}
                </Text>
              </Text>
              {/* <Text allowFontScaling={false} style={styles.icons}>
                <FontAwesome style={{ marginRight: 5 }} name="phone" size={16} color="#b2bdbf" />{' '}
                <Text allowFontScaling={false} style={styles.iconText}>
                  {item.communicationHistories ? item.communicationHistories.length : 0}
                </Text>
              </Text> */}
              <Text allowFontScaling={false} style={styles.icons}>
                <MaterialCommunityIcons
                  style={{ marginRight: 5 }}
                  name="message-reply"
                  size={16}
                  color="#b2bdbf"
                />{' '}
                <Text allowFontScaling={false} style={styles.iconText}>
                  {item.communicationHistories ? item.communicationHistories.length : 0}
                </Text>
              </Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingBottom: 5,
              }}
            >
              <Text allowFontScaling={false} style={{ color: '#b2bdbf', fontWeight: '400' }}>
                {t('simple:created') + getDateByMonth(item.created)}
              </Text>
              <View>
                <Text
                  allowFontScaling={false}
                  style={{
                    fontSize: 12,
                    paddingVertical: 2,
                    color: getStatus(item.status).color,
                    borderWidth: 1,
                    borderColor: getStatus(item.status).color,
                    borderRadius: 5,
                    padding: 5,
                  }}
                >
                  {getStatus(item.status).text}
                </Text>
              </View>
            </View>
          </View>
          {client && (
            <View
              style={{
                flex: 1,
                marginVertical: 10,
                borderBottomColor: '#e9f0f4',
                borderBottomWidth: 2,
              }}
            >
              <Text allowFontScaling={false} style={[styles.info, { marginLeft: '5%' }]}>
                {t('menu:customer')}:
              </Text>
              <View style={styles.orderContainer}>
                <View style={{ flex: 1, justifyContent: 'center' }}>
                  <View style={styles.orderPerson}>
                    <Avatar
                      rounded
                      size="medium"
                      icon={{ name: 'user', type: 'font-awesome' }}
                      activeOpacity={0.7}
                      containerStyle={{ flex: 2, justifyContent: 'center' }}
                      source={{
                        uri: item.customer.avatar
                          ? `${config.url}/images/${item.customer.avatar.imageName}`
                          : 'https://media.istockphoto.com/photos/icon-of-a-businessman-avatar-or-profile-pic-picture-id474001892?k=6&m=474001892&s=612x612&w=0&h=6g0M3Q3HF8_uMQpYbkM9XAAoEDym7z9leencMcC4pxo=',
                      }}
                    />
                  </View>
                </View>
                <View style={styles.orderText}>
                  <Text
                    allowFontScaling={false}
                    style={{
                      color: 'black',
                      fontWeight: '500',
                      fontSize: 16,
                    }}
                  >
                    {item.customer.firstName} {item.customer.lastName}
                  </Text>
                  {getLastOnline(item.customer.lastRequest) === 'online' ? (
                    <Badge
                      style={{
                        height: 20,
                        marginBottom: 3,
                      }}
                      success
                    >
                      <Text allowFontScaling={false} style={{ color: '#fff' }}>
                        online
                      </Text>
                    </Badge>
                  ) : (
                    <Text allowFontScaling={false} style={styles.info}>
                      {getLastOnline(item.customer.lastRequest)}
                    </Text>
                  )}
                  <Text allowFontScaling={false} style={styles.info}>
                    {t('login:sex')}: {t(`profile:${item.customer.sex}`)} |{t('order:orders')}:{' '}
                    {item.customer.userOrderCount}
                  </Text>
                </View>
              </View>
            </View>
          )}
          {item.master && (
            <View
              style={{
                flex: 1,
                marginVertical: 10,
                borderBottomColor: '#e9f0f4',
                borderBottomWidth: 2,
              }}
            >
              <Text allowFontScaling={false} style={[styles.info, { marginLeft: '5%' }]}>
                Мастер:
              </Text>
              <View style={styles.orderContainer}>
                <View style={{ flex: 1, justifyContent: 'center' }}>
                  <View style={styles.orderPerson}>
                    <Avatar
                      rounded
                      size="medium"
                      icon={{ name: 'user', type: 'font-awesome' }}
                      activeOpacity={0.7}
                      containerStyle={{ flex: 2, justifyContent: 'center' }}
                      source={{
                        uri: item.master.avatar
                          ? `${config.url}/images/${item.master.avatar.imageName}`
                          : 'https://media.istockphoto.com/photos/icon-of-a-businessman-avatar-or-profile-pic-picture-id474001892?k=6&m=474001892&s=612x612&w=0&h=6g0M3Q3HF8_uMQpYbkM9XAAoEDym7z9leencMcC4pxo=',
                      }}
                    />
                  </View>
                </View>
                <View style={styles.orderText}>
                  <Text
                    allowFontScaling={false}
                    style={{
                      color: 'black',
                      fontWeight: '500',
                      fontSize: 16,
                    }}
                  >
                    {item.master.firstName} {item.master.lastName}
                  </Text>
                  {getLastOnline(item.master.lastRequest) === 'online' ? (
                    <Badge
                      style={{
                        height: 20,
                        marginBottom: 3,
                      }}
                      success
                    >
                      <Text allowFontScaling={false} style={{ color: '#fff' }}>
                        online
                      </Text>
                    </Badge>
                  ) : (
                    <Text allowFontScaling={false} style={styles.info}>
                      {getLastOnline(item.master.lastRequest)}
                    </Text>
                  )}
                  <Text allowFontScaling={false} style={styles.info}>
                    {t('login:sex')}: {t(`profile:${item.master.sex}`)} |{t('order:orders')}:{' '}
                    {item.master.masterOrderCount}
                  </Text>
                </View>
              </View>
            </View>
          )}
          <View style={{ paddingHorizontal: '5%' }}>
            <View style={{ flexDirection: 'row', paddingTop: 10 }}>
              <Text allowFontScaling={false} style={{ color: '#b2bdbf', fontWeight: '400' }}>
                Специализация:{' '}
              </Text>
              <Text allowFontScaling={false} style={{ fontWeight: '500', flexShrink: 1 }}>
                {' ' + item.specialization.specName}
              </Text>
            </View>
            <Text
              allowFontScaling={false}
              style={{ fontWeight: '600', fontSize: 19, paddingVertical: 5 }}
            >
              {item.description}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <View
                style={{
                  width: 23,
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                }}
              >
                <FontAwesome
                  style={{ paddingVertical: 3 }}
                  name="clock-o"
                  color="#c20021"
                  size={18}
                />
                <Text
                  allowFontScaling={false}
                  style={{
                    color: '#c20021',
                    fontSize: 19,
                    fontWeight: '500',
                    paddingVertical: 3,
                    marginLeft: 3,
                    textAlign: 'center',
                  }}
                >
                  ₸{' '}
                </Text>
                {item.address && (
                  <FontAwesome
                    style={{ paddingVertical: 3 }}
                    name="map-marker"
                    color="#c20021"
                    size={18}
                  />
                )}
              </View>
              <View
                style={{
                  justifyContent: 'flex-start',
                }}
              >
                <Text
                  allowFontScaling={false}
                  style={{
                    color: 'black',
                    fontWeight: '500',
                    fontSize: 16,
                    textTransform: 'capitalize',
                    paddingVertical: 3,
                  }}
                >
                  {getOrderDate(item.urgency, item.urgencyDate)}
                </Text>
                <Text
                  allowFontScaling={false}
                  style={{
                    color: 'black',
                    fontWeight: '500',
                    fontSize: 16,
                    textTransform: 'capitalize',
                    paddingVertical: 3,
                  }}
                >
                  {getOrderPrice(item.orderPriceType, item.price)}
                </Text>
                {item.address && (
                  <Text
                    allowFontScaling={false}
                    style={{
                      color: 'black',
                      fontWeight: '500',
                      fontSize: 16,
                      flexShrink: 1,
                      paddingRight: '5%',
                      textTransform: 'capitalize',
                      paddingVertical: 3,
                    }}
                  >
                    {item.address}
                  </Text>
                )}
              </View>
            </View>
            <View style={{ flexDirection: 'row', paddingVertical: 10 }}>
              {item.images &&
                item.images.map((image, index) => (
                  <TouchableOpacity key={index} onPress={() => this.openImage(index)}>
                    <Image
                      source={{ uri: `${config.url}/images/${image.imageName}` }}
                      style={{ width: 100, height: 100, marginRight: 10 }}
                    />
                  </TouchableOpacity>
                ))}
            </View>
            {client || (
              <View
                style={{
                  borderTopWidth: 1.5,
                  borderBottomWidth: 1.5,
                  borderColor: '#b2bdbf',
                  marginVertical: 5,
                  paddingVertical: 6,
                  paddingHorizontal: 5,
                }}
              >
                <View style={{ flexDirection: 'row' }}>
                  <MaterialCommunityIcons name="bell-outline" color="#c20021" size={25} />
                  {/* <Text
                    allowFontScaling={false}
                    style={{
                      fontSize: 16,
                      marginLeft: 5,
                      fontWeight: '500',
                      color: '#c20021',
                    }}
                  >
                    {getCommunicationType(item.communicationType)}
                  </Text> */}
                </View>
              </View>
            )}
            {item.coordinates && (
              <MapView
                onPress={() => setShowMap(true)}
                style={{
                  marginVertical: 10,
                  alignSelf: 'stretch',
                  height: 200,
                }}
                initialRegion={{
                  latitude: JSON.parse(item.coordinates.toLowerCase()).latitude,
                  longitude: JSON.parse(item.coordinates.toLowerCase()).longitude,
                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.0421,
                }}
                pitchEnabled={false}
                rotateEnabled={false}
                zoomEnabled={false}
                scrollEnabled={false}
              >
                <Marker
                  coordinate={{
                    latitude: JSON.parse(item.coordinates.toLowerCase()).latitude,
                    longitude: JSON.parse(item.coordinates.toLowerCase()).longitude,
                  }}
                />
              </MapView>
            )}
            <TouchableOpacity
              onPress={() => {
                if (promo?.marketId) {
                  increaseViewCount('BANNER_FOLLOW', promo?.id);

                  navigation.navigate('MarketIntoOrder', {
                    marketId: promo?.marketId,
                  });
                }
              }}
            >
              <Image
                style={{
                  borderRadius: 10,
                  paddingHorizontal: '5%',
                  height: 250,
                }}
                resizeMode="contain"
                source={{
                  uri: promo
                    ? `http://91.201.215.45:49153/images/${promo.image.imageName}`
                    : config.defaultImage,
                }}
              />
            </TouchableOpacity>
            {client || (
              <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                {item.status === 'WAITING_FOR_CUSTOMER_RESPONSE' || (
                  <TouchableOpacity onPress={() => setCancelOrderModalVisible(true)}>
                    <Text allowFontScaling={false} style={{ color: '#c20021', marginVertical: 5 }}>
                      {t('order:cancelOrder')}
                    </Text>
                  </TouchableOpacity>
                )}
                {(item.status === 'MODERATION' || item.status === 'OPEN') && (
                  <TouchableOpacity
                    onPress={navigateToEdit}
                    style={{
                      borderRadius: 5,
                      backgroundColor: '#e9f0f4',
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                    }}
                  >
                    <Text
                      allowFontScaling={false}
                      style={{
                        color: '#c20021',
                        marginVertical: 5,
                        marginHorizontal: 3,
                        fontWeight: '500',
                        fontSize: 16,
                      }}
                    >
                      <FontAwesome name="pencil" size={20} color="#c20021" /> {t('order:editOrder')}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        </View>
        {notShowReopen === undefined &&
          (item.status === 'CANCELLED' || item.status === 'COMPLETED') && (
            <Button style={styles.writeButton} onPress={() => reopenOrder()} block>
              <View style={{ width: '100%' }}>
                <Text
                  allowFontScaling={false}
                  style={{
                    color: 'white',
                    fontSize: 17,
                    fontWeight: '500',
                    textAlign: 'center',
                  }}
                >
                  {t('order:repeat')}
                </Text>
              </View>
            </Button>
          )}
        {client && (
          <View
            style={{
              width: '100%',
              height: 2,
              backgroundColor: '#e9f0f4',
              marginVertical: 10,
            }}
          />
        )}
        <View style={{ height: 15 }} />
      </ScrollView>

      {notShowReopen === undefined && item.status === 'WAITING_FOR_CUSTOMER_RESPONSE' && (
        <Button
          style={[styles.writeButton, { marginBottom: 5 }]}
          onPress={() => finishOrder()}
          block
        >
          <Text
            allowFontScaling={false}
            style={{
              textAlign: 'center',
              width: '100%',
              color: 'white',
              fontSize: 17,
              fontWeight: '500',
            }}
          >
            {t('order:finishOrder')}
          </Text>
        </Button>
      )}

      <Modal animationType="slide" transparent={true} visible={cancelOrderModalVisible}>
        <View
          style={{
            width: '100%',
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            paddingBottom: 20,
            backgroundColor: 'rgba(0,0,0,0.84)',
          }}
        >
          <View
            style={{
              width: '80%',
              paddingHorizontal: 30,
              paddingVertical: 15,
              borderRadius: 10,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: '#fff',
            }}
          >
            <Text allowFontScaling={false} style={styles.titleTextModal}>
              {t('order:causeOfFinish')}
            </Text>
            <RadioForm style={{ width: '100%' }} initial={0}>
              {radio_props.map((obj, i) => (
                <RadioButton style={{ marginVertical: 10 }} labelHorizontal={true} key={i}>
                  <RadioButtonInput
                    obj={obj}
                    index={i}
                    isSelected={cancellationReason === obj.value}
                    borderWidth={1}
                    onPress={(value) => setCancellationReason(value)}
                    buttonInnerColor={'#c20021'}
                    buttonOuterColor={'#cadadd'}
                    buttonStyle={{}}
                    buttonSize={15}
                  />
                  <View>
                    <RadioButtonLabel
                      obj={obj}
                      index={i}
                      labelHorizontal={true}
                      onPress={(value) => setCancellationReason(value)}
                      labelStyle={{ fontSize: 16, textAlign: 'left' }}
                      labelWrapStyle={{ textAlign: 'left' }}
                    />
                  </View>
                </RadioButton>
              ))}
            </RadioForm>
            <Button onPress={okCancelOrder} style={styles.buttonModal}>
              <Text
                allowFontScaling={false}
                style={{
                  width: '100%',
                  color: '#fff',
                  textAlign: 'center',
                  fontSize: 16,
                  fontWeight: '500',
                }}
              >
                {t('order:finishOrder')}
              </Text>
            </Button>
            <Button light onPress={() => setCancelOrderModalVisible(false)}>
              <Text
                allowFontScaling={false}
                style={{
                  width: '100%',
                  color: '#c20021',
                  textAlign: 'center',
                  fontSize: 16,
                  fontWeight: '500',
                }}
              >
                {t('simple:closeWindow')}
              </Text>
            </Button>
          </View>
        </View>
      </Modal>

      <Modal animationType="fade" transparent={false} visible={showMap}>
        <View style={{ height }}>
          {item.coordinates && item.coordinates.toLowerCase().indexOf('latitude') > 0 && (
            <MapView
              onPress={() => setShowMap(true)}
              style={{
                alignSelf: 'stretch',
                height: height - 70,
              }}
              region={{
                latitude: JSON.parse(item.coordinates.toLowerCase()).latitude,
                longitude: JSON.parse(item.coordinates.toLowerCase()).longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }}
            >
              <Marker
                coordinate={{
                  latitude: JSON.parse(item.coordinates.toLowerCase()).latitude,
                  longitude: JSON.parse(item.coordinates.toLowerCase()).longitude,
                }}
              />
            </MapView>
          )}

          <Button light onPress={() => setShowMap(false)}>
            <Text
              allowFontScaling={false}
              style={{
                width: '100%',
                color: '#c20021',
                textAlign: 'center',
                fontSize: 16,
                fontWeight: '500',
              }}
            >
              {t('simple:close')}
            </Text>
          </Button>
        </View>
      </Modal>

      <ImageView
        glideAlways
        images={images}
        imageIndex={imageIndex}
        animationType="fade"
        isVisible={visibleImage}
        onClose={() => setVisibleImage(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  icons: {
    width: '17%',
    textAlign: 'right',
  },
  iconText: {
    color: '#b2bdbf',
    fontSize: 16,
    marginLeft: 5,
  },
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
  info: {
    fontWeight: '400',
    fontSize: 14,
    color: '#999999',
  },
  orderPerson: {
    width: '80%',
    // justifyContent:'center',
    alignItems: 'center',
  },
  specialization: {
    fontWeight: '500',
    fontSize: 14,
  },
  orderText: {
    width: '70%',
    paddingLeft: 12,
  },
  titleTextModal: {
    fontSize: 24,
    marginBottom: 10,
    fontWeight: '600',
    width: '100%',
    textAlign: 'center',
  },
  describeTextModal: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  buttonModal: {
    backgroundColor: '#c20021',
    width: '100%',
    alignItems: 'center',
    textAlign: 'center',
    marginVertical: 5,
  },
  writeButton: {
    alignSelf: 'center',
    backgroundColor: '#c20021',
    width: '90%',
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 15,
    marginTop: 10,
  },
});

export default OrderComponent;
