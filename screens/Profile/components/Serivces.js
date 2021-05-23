import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Entypo, FontAwesome } from '@expo/vector-icons';

export const Serivces = ({ t, edit, services, setStateValues, popUpInfo3 }) => {
  return (
    <>
      <View style={styles.view}>
        <Text allowFontScaling={false} style={styles.labelInfo}>
          {t('profile:servicesAndPrices')} ({services ? services.length : 0})
        </Text>
        <TouchableOpacity
          onPress={() => setStateValues('popUpInfo3', !popUpInfo3)}
          style={styles.diamond}
        >
          <View
            style={{
              transform: [{ rotate: '-45deg' }],
            }}
          >
            <Entypo
              name={popUpInfo3 ? 'circle-with-cross' : 'info'}
              size={popUpInfo3 ? 15 : 12}
              color="white"
            />
          </View>
        </TouchableOpacity>
      </View>
      {services?.length > 0 ? (
        services.map((service, index) => {
          return (
            <View key={index} style={styles.serviceWrapper}>
              <View style={edit ? styles.serviceNameViewEdit : styles.serviceNameViewNoEdit}>
                <Text allowFontScaling={false} style={styles.serviceName}>
                  {service.serviceName}
                </Text>
              </View>
              <View style={styles.serviceCostView}>
                <Text allowFontScaling={false} style={styles.serviceCost}>
                  {service.cost} {service.unit}
                </Text>
              </View>
              {edit && (
                <TouchableOpacity
                  onPress={() => {
                    setStateValues('deleteServiceId', service.id);
                    setStateValues('deleteServiceModal', true);
                  }}
                >
                  <FontAwesome color="#c20021" name="trash-o" size={20} />
                </TouchableOpacity>
              )}
            </View>
          );
        })
      ) : (
        <View style={styles.noServiceView}>
          <Text allowFontScaling={false} style={styles.noServiceText}>
            {t('simple:noServices')}
          </Text>
          <Text allowFontScaling={false} style={styles.pressToEdit}>
            {t('simple:pressToEdit')}
          </Text>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  view: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  labelInfo: {
    textAlign: 'left',
    fontSize: 18,
    fontWeight: '500',
    marginTop: 7,
    marginBottom: 15,
  },
  diamond: {
    width: 18,
    height: 18,
    backgroundColor: '#c20021',
    transform: [{ rotate: '45deg' }],
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoHelps: { color: '#b2bdbf', fontWeight: '400' },
  video: {
    marginTop: 20,
    width: '95%',
    height: 220,
    alignSelf: 'center',
  },
  noServiceView: { marginVertical: 15 },
  noServiceText: {
    textAlign: 'center',
    color: '#b2bdbf',
    fontSize: 16,
    fontWeight: '500',
  },
  pressToEdit: {
    textAlign: 'center',
    color: '#b2bdbf',
    fontSize: 14,
  },
  serviceWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 7,
    width: '100%',
  },
  serviceName: { color: '#999999', fontSize: 15 },
  serviceCost: { color: 'black', fontSize: 15 },
  serviceCostView: {
    backgroundColor: '#e9f0f4',
    padding: 5,
    width: '37%',
  },
  serviceNameViewEdit: {
    backgroundColor: '#e9f0f4',
    padding: 5,
    width: '55%',
  },
  serviceNameViewNoEdit: {
    backgroundColor: '#e9f0f4',
    padding: 5,
    width: '60%',
  },
});
