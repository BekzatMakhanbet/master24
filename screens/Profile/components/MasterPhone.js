import React from 'react';
import { View, Text } from 'react-native';
import { StyleSheet } from 'react-native';

export const MasterPhone = ({ phoneNumber, edit, t, setStateValues }) => {
  return (
    <View style={styles.view}>
      <View style={edit && styles.marginBottom}>
        <Text allowFontScaling={false} style={styles.labelInfo}>
          {t('simple:contactNumber')}
        </Text>
        <Text
          allowFontScaling={false}
          // onPress={() => setStateValues('changeMobileNumber', true)}
          style={styles.textInfo}
        >
          +7 {phoneNumber}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  view: {
    width: '95%',
    paddingBottom: 5,
    paddingHorizontal: 5,
    alignSelf: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#cadadd',
  },
  marginBottom: {
    marginBottom: 2,
  },
  textInfo: {
    color: 'black',
    fontWeight: '400',
    textAlign: 'left',
    marginVertical: 7,
  },
  labelInfo: {
    textAlign: 'left',
    fontSize: 18,
    fontWeight: '500',
    marginTop: 7,
  },
});
