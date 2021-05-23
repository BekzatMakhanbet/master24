import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'react-native-elements';
import { AntDesign } from '@expo/vector-icons';
import getNamesLocal from '../../../utils/getNamesLocal';
import getUserRating from '../../../utils/getUserRating';
import getAge from '../../../utils/getAge';

export const MasterProfileInfo = ({ user, city, t }) => {
  return (
    <View style={styles.view}>
      <Text allowFontScaling={false} style={styles.name}>
        {user.firstName} {user.lastName}
      </Text>
      <View style={styles.row}>
        <View style={styles.row}>
          <AntDesign name="star" size={19} color={user.rating > 20 ? '#c20021' : '#999999'} />
          <Text allowFontScaling={false} style={styles.specilization}>
            {user.rating > 0 ? '+' : ''}
            {user.rating}{' '}
          </Text>
        </View>
        <View style={styles.row}>
          <Text allowFontScaling={false} style={styles.info}>
            | {getUserRating(user.rating)}{' '}
          </Text>
        </View>
        <View style={styles.row}>
          <Image
            source={
              user.status === 'VERIFIED'
                ? require('../../../assets/images/checked.png')
                : require('../../../assets/images/unchecked.png')
            }
            style={styles.icons}
          />
          <Text allowFontScaling={false} style={[styles.info]}>
            | {t(`profile:${user.status}`)}{' '}
          </Text>
        </View>
      </View>
      <Text allowFontScaling={false} style={styles.info}>
        {getNamesLocal(city.cityName, city.cityNameKz)} | {t(`profile:${user.sex}`)},{' '}
        {user.birthday && getAge(user.birthday)} лет
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  view: {
    marginTop: 10,
    width: '95%',
    alignSelf: 'center',
    alignItems: 'center',
    borderBottomColor: '#cadadd',
    paddingBottom: 15,
    borderBottomWidth: 2,
  },
  name: { fontSize: 19, fontWeight: '500', textAlign: 'center' },
  row: { flexDirection: 'row' },
  specilization: {
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 19,
  },
  icons: {
    width: 16,
    height: 18,
    marginLeft: 1,
  },
  info: {
    fontWeight: '400',
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
  },
});
