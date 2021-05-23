import React, { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { Text } from 'react-native';
import styles from '../styles';

export const MyOrdersGuide = () => {
  const { t } = useTranslation();

  return (
    <Fragment>
      <Text allowFontScaling={false} style={styles.title}>
        {t('guide:howGiveOrder')}
      </Text>
      <Text allowFontScaling={false} style={styles.text}>
        {t('guide:howGiveOrderExplanation')}
      </Text>
      <Text allowFontScaling={false} style={styles.title}>
        {t('guide:moreInHowItWorks')}
      </Text>
    </Fragment>
  );
};
