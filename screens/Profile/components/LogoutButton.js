import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export const LogoutButton = ({ t, exit }) => {
  return (
    <TouchableOpacity onPress={exit} style={styles.exitButton}>
      <Text allowFontScaling={false} style={styles.exitText}>
        {t('simple:logOut')}{' '}
      </Text>
      <MaterialCommunityIcons name="exit-to-app" size={26} color="#c20021" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  exitButton: {
    alignSelf: 'center',
    marginBottom: 50,
    flexDirection: 'row',
  },
  exitText: {
    color: '#c20021',
    fontSize: 18,
    fontWeight: '400',
  },
});
