import React from 'react';
import { View, Text, Platform, Dimensions } from 'react-native';
import { StyleSheet } from 'react-native';

const { width } = Dimensions.get('window');

export const PopupInfo = ({ t }) => {
  return (
    <View style={styles.view}>
      <Text allowFontScaling={false} style={styles.textBold}>
        {t('profile:fillToGetAttention')}
      </Text>
      <Text allowFontScaling={false} style={styles.text}>
        {t('profile:fillToGetAttention2')}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  view: {
    position: 'absolute',
    width: width * 0.9,
    marginRight: width * 0.05,
    backgroundColor: '#e3f7ff',
    borderRadius: 20,
    padding: 10,
    top: 35,
    zIndex: 1000000000,
    elevation: Platform.OS === 'android' ? 50 : 0,
  },
  text: {
    textAlign: 'center',
    color: '#999999',
    fontWeight: '500',
  },
  textBold: {
    textAlign: 'center',
    color: '#999999',
    fontWeight: '500',
  },
});
