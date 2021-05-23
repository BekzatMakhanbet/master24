import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

export const SaveClientButton = ({ changeMode, edit, t }) => {
  return (
    <View style={styles.view}>
      <TouchableOpacity onPress={changeMode} style={styles.touchableOpacity}>
        {edit ? (
          <Text allowFontScaling={false} style={styles.readyText}>
            {t('simple:ready')}
          </Text>
        ) : (
          <FontAwesome name="pencil" color="white" size={16} />
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  view: {
    position: 'absolute',
    top: 70,
    marginRight: '5%',
    alignSelf: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  touchableOpacity: {
    padding: 10,
    borderRadius: 50,
    backgroundColor: '#c20021',
  },
  readyText: { color: 'white', textAlign: 'center' },
});
