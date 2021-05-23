import React, { useState } from 'react';
import { Feather, FontAwesome } from '@expo/vector-icons';
import { Modal, TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Label, Button, Spinner } from 'native-base';
import { Input } from 'react-native-elements';
import MapView, { Marker } from 'react-native-maps';
import * as Permissions from 'expo-permissions';
import * as Location from 'expo-location';

const OrderAddress = ({ address, t, setAddress, coordinates, setCoordinates }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [asking, setAsking] = useState(false);
  const [mapData, setMapData] = useState({
    longitude: coordinates.longitude,
    latitude: coordinates.latitude,
    latitudeDelta: 0.015,
    longitudeDelta: 0.0121,
  });

  _getLocationAsync = async () => {
    setAsking(true);

    let { status } = await Permissions.askAsync(Permissions.LOCATION);

    if (status !== 'granted') {
      setAsking(false);
    } else {
      let location = await Location.getCurrentPositionAsync({
        enableHighAccuracy: true,
      });
      const { latitude, longitude } = location.coords;
      setAsking(false);

      setCoordinates({ latitude, longitude });
      setMapData({
        latitude,
        longitude,
        latitudeDelta: 0.015,
        longitudeDelta: 0.0121,
      });
    }
  };

  handleRegionChange = (mapData) => {
    const { latitude, longitude } = mapData;
    setCoordinates({ latitude, longitude });
    setMapData(mapData);
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <View>
          <Label style={styles.inputLabel2}>{t('createOrder:pointAddress')}</Label>
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            style={{
              flexDirection: 'row',
              width: '100%',
              justifyContent: 'space-between',
              marginTop: 10,
            }}
          >
            <Text allowFontScaling={false} style={{ fontSize: 16 }}>
              {address}
            </Text>
            <Feather name="chevron-right" size={26} color="#999999" />
          </TouchableOpacity>
        </View>
      </View>
      <Modal animationType="slide" transparent={true} visible={modalVisible}>
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
            <Text allowFontScaling={false} style={styles.titleText}>
              {t('createOrder:pointAddress')}
            </Text>
            <Input
              value={address}
              onChangeText={(val) => setAddress(val)}
              inputContainerStyle={{ width: '105%', marginLeft: '-2.5%' }}
              placeholder={t('createOrder:addressExample')}
            />
            <Text allowFontScaling={false} style={styles.describeText}>
              {t('createOrder:addressHelps')}
            </Text>
            {coordinates.latitude && (
              <MapView
                style={{
                  marginVertical: 10,
                  alignSelf: 'stretch',
                  height: 200,
                }}
                region={mapData}
                onRegionChangeComplete={handleRegionChange}
              >
                <Marker coordinate={coordinates} title="Адрес" />
              </MapView>
            )}
            <Button
              onPress={() => {
                if (coordinates.latitude) {
                  setCoordinates({ latitude: null, longitude: null });
                } else {
                  _getLocationAsync();
                }
              }}
              small
              style={{ width: '65%', marginTop: 10 }}
              light
            >
              {asking ? (
                <View style={{ alignSelf: 'center' }}>
                  <Spinner color="red" />
                </View>
              ) : (
                <Text allowFontScaling={false} style={styles.buttonText}>
                  <FontAwesome name="paper-plane-o" size={20} />{' '}
                  {coordinates.latitude ? 'Закрыть карту' : t('createOrder:myLocation')}
                </Text>
              )}
            </Button>
            <Button onPress={() => setModalVisible(false)} style={styles.buttonModal}>
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
                {t('createOrder:continuneButton')}
              </Text>
            </Button>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '94%',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  titleText: {
    fontSize: 19,
    fontWeight: '500',
    marginVertical: 10,
  },
  describeText: {
    fontSize: 14,
    color: '#999999',
    paddingVertical: 7,
  },
  buttonText: {
    color: '#c20021',
    fontSize: 13,
    fontWeight: '500',
  },
  buttonModal: {
    backgroundColor: '#c20021',
    width: '100%',
    alignItems: 'center',
    textAlign: 'center',
    marginVertical: 5,
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
    marginVertical: 15,
  },
  continuneText: {
    fontSize: 17,
    fontWeight: '500',
    color: '#fff',
  },
  inputContainer: {
    borderBottomWidth: 1,
    width: '95%',
    borderBottomColor: '#8b998f',
    marginVertical: 1,
  },
  inputLabel2: {
    fontSize: 13,
    color: '#8b998f',
    marginLeft: 2,
    fontWeight: '500',
  },
});

export default OrderAddress;
