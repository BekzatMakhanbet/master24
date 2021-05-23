import React, { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import styles from '../styles';
import stylesObject from '../../../constants/style/stylesObject';

export const ProfileGuide = () => {
  const { t } = useTranslation();

  return (
    <Fragment>
      <Text allowFontScaling={false} style={styles.textUnderlined}>
        {t('guide:freeToRegister')}
      </Text>
      <Text allowFontScaling={false} style={styles.title}>
        {t('guide:howToRegister')}
      </Text>
      <Text allowFontScaling={false} style={styles.text}>
        {t('guide:registerInfo')}
      </Text>
      <Text allowFontScaling={false} style={styles.title}>
        {t('guide:howGetInformedAboutNewOrders')}
      </Text>
      <Text allowFontScaling={false} style={styles.text}>
        {t('guide:howGetInformedAboutNewOrdersExplanation')}
      </Text>
      <Text allowFontScaling={false} style={styles.title}>
        {t('guide:ratingOnPortal')}
      </Text>
      <Text allowFontScaling={false} style={styles.text}>
        {t('guide:ratingExplanation')}
      </Text>
      <View style={stylesObject.defaultFlexRow}>
        <View>
          <Text style={styles.text}>* 5 {t('guide:stars2')}</Text>
          <Text style={styles.text}>* 4 {t('guide:stars')}</Text>
          <Text style={styles.text}>* 3 {t('guide:stars')}</Text>
          <Text style={styles.text}>* 2 {t('guide:stars')}</Text>
          <Text style={styles.text}>* 1 {t('guide:star')}</Text>
        </View>
        <View>
          <Text style={styles.text}>+2 {t('guide:points')}</Text>
          <Text style={styles.text}>+1 {t('guide:point')}</Text>
          <Text style={styles.text}>+0 {t('guide:points2')}</Text>
          <Text style={styles.text}>-1 {t('guide:point')}</Text>
          <Text style={styles.text}>-2 {t('guide:points')}</Text>
        </View>
      </View>
      <Text allowFontScaling={false} style={styles.text}>
        {t('guide:whenBeBlocked')}
      </Text>
      <Text allowFontScaling={false} style={styles.title}>
        {t('guide:statusProfile')}
      </Text>
      <Text allowFontScaling={false} style={styles.text}>
        {t('guide:statusProfileExplanation')}
      </Text>
      <View>
        <Text style={styles.text}>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{'Рейтинг < 20'}{' '}
          {t('guide:starter')}
        </Text>
        <Text style={styles.text}>
          {'20 ≤ Рейтинг < 40'} {t('guide:specialist')}
        </Text>
        <Text style={styles.text}>
          {'40 ≤ Рейтинг < 60'} {t('guide:expert')}
        </Text>
        <Text style={styles.text}>
          {'60 ≤ Рейтинг < 80'} {t('guide:proffesional')}
        </Text>
      </View>
      <Text allowFontScaling={false} style={styles.title}>
        {t('guide:reviewsAndGrades')}
      </Text>
      <Text allowFontScaling={false} style={styles.text}>
        {t('guide:canSeeGradesInReviews')}
      </Text>
      <Text allowFontScaling={false} style={styles.title}>
        {t('guide:howToGetChecked')}
      </Text>
      <Text allowFontScaling={false} style={styles.text}>
        {t('guide:howToGetCheckedExplanation')}
      </Text>
      <Text allowFontScaling={false} style={styles.text}>
        {t('guide:fullFilledProfile')}
      </Text>
      <Text allowFontScaling={false} style={styles.title}>
        {t('guide:moreInHowItWorks')}
      </Text>
    </Fragment>
  );
};
