import React from 'react';
import { useTranslation } from 'react-i18next';
import { Image, ScrollView, Text } from 'react-native';
import { connect } from 'react-redux';
import styles from './styles';

const AboutAppGuide = () => {
  const { t } = useTranslation();

  return (
    <ScrollView contentContainerStyle={styles.contentStyle}>
      <Text allowFontScaling={false} style={styles.text}>
        <Text style={styles.title}>{t('guide:serviceName')}</Text> {t('guide:aboutAppService')}
      </Text>
      <Text allowFontScaling={false} style={styles.title}>
        {t('menu:howItWorks')}
      </Text>
      <Image style={styles.images} source={require('../../assets/images/zakaz.jpg')} />
      <Text allowFontScaling={false} style={styles.title}>
        {t('guide:giveAnOrderFree')}
      </Text>
      <Text allowFontScaling={false} style={styles.text}>
        {t('guide:giveAnOrderFreeExplanation')}
      </Text>

      <Image style={styles.images} source={require('../../assets/images/otklik.jpg')} />
      <Text allowFontScaling={false} style={styles.title}>
        {t('guide:chooseCorrespondingMaster')}
      </Text>
      <Text allowFontScaling={false} style={styles.text}>
        {t('guide:chooseCorrespondingMasterExplanation')}
      </Text>

      <Image style={styles.images} source={require('../../assets/images/vybor.jpg')} />
      <Text allowFontScaling={false} style={styles.title}>
        {t('guide:finishOrder')}
      </Text>
      <Text allowFontScaling={false} style={styles.text}>
        {t('guide:finishOrderExplanation')}
      </Text>

      <Text allowFontScaling={false} style={styles.title}>
        {t('guide:howToBecomeMaster')}
      </Text>

      <Text allowFontScaling={false} style={styles.titleCentered}>
        {t('guide:registerAndGetOrder')}
      </Text>
      <Text allowFontScaling={false} style={styles.text}>
        {t('guide:registerAndGetOrderExplanation')}
      </Text>

      <Text allowFontScaling={false} style={styles.titleCentered}>
        {t('guide:talkWithCustomers')}
      </Text>
      <Text allowFontScaling={false} style={styles.text}>
        {t('guide:talkWithCustomersExplanation')}
      </Text>

      <Text allowFontScaling={false} style={styles.titleCentered}>
        {t('guide:provideGoodService')}
      </Text>
      <Text allowFontScaling={false} style={styles.text}>
        {t('guide:provideGoodServiceExplanation')}
      </Text>
    </ScrollView>
  );
};

export default connect(({ modeReducer }) => ({ modeReducer }), {})(AboutAppGuide);
