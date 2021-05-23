import React, { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, Image, View } from 'react-native';
import styles from '../styles';
import { FontAwesome } from '@expo/vector-icons';
import { getModeColor } from '../../../utils/getModeColor';
import stylesObject from '../../../constants/style/stylesObject';

export const OrdersListGuide = () => {
  const { t } = useTranslation();

  return (
    <Fragment>
      <View style={stylesObject.defaultFlexRow}>
        <Image style={styles.icons} source={require('../../../assets/images/Заказы.png')} />
        <Text allowFontScaling={false} style={styles.text}>
          {t('guide:orderListInfo')}
        </Text>
      </View>
      <View style={stylesObject.defaultFlexRow}>
        <FontAwesome size={22} name={'bullhorn'} color={getModeColor('master')} />

        <Text allowFontScaling={false} style={styles.text}>
          {t('guide:promosInfo')}
        </Text>
      </View>

      <View style={stylesObject.defaultFlexRow}>
        <Image style={styles.icons} source={require('../../../assets/images/Товары.png')} />

        <Text allowFontScaling={false} style={styles.text}>
          {t('guide:marketInfo')}
        </Text>
      </View>

      <Text allowFontScaling={false} style={styles.title}>
        {t('guide:responds')}
      </Text>
      <Text allowFontScaling={false} style={styles.text}>
        {t('guide:hereFixesAllResponds')}
      </Text>
      <Text allowFontScaling={false} style={styles.title}>
        {t('guide:moreInHowItWorks')}
      </Text>
    </Fragment>
  );
};
