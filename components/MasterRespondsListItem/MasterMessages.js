import React from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text } from 'react-native';
import getDateByMonth from '../../utils/getDateByMonth';
import stylesObject from '../../constants/style/stylesObject';
import { StyleSheet } from 'react-native';
import getNamesLocal from '../../utils/getNamesLocal';

export const MasterMessages = ({ histories, statusText, last }) => {
  const { t } = useTranslation();

  return (
    <>
      <View style={styles.messageContainer}>
        {histories.map((history, index) => {
          return (
            history.communicationType === 'MESSAGE' && (
              <Text allowFontScaling={false} key={index}>
                {t('simple:youWrote')}: {getNamesLocal(history.text, history.textKz)}
              </Text>
            )
          );
        })}
        {histories.map((history, index) => {
          return (
            history.communicationType === 'CALL' && (
              <View key={index} style={stylesObject.defaultFlexRow}>
                <Text allowFontScaling={false}> {t('simple:youCall')}: </Text>
                <Text allowFontScaling={false}>{getDateByMonth(history.created)}</Text>
              </View>
            )
          );
        })}
      </View>
      <Text allowFontScaling={false} style={styles.statusText}>
        {statusText}
      </Text>
      {last || <View style={styles.lastLine} />}
    </>
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    width: '90%',
    alignSelf: 'center',
    backgroundColor: '#e3f7ff',
    borderRadius: 5,
    paddingLeft: 10,
    paddingRight: 30,
    paddingVertical: 4,
    marginVertical: 5,
  },
  statusText: {
    color: '#c20021',
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
    marginBottom: 10,
  },
  lastLine: {
    backgroundColor: '#cadadd',
    height: 2,
    marginBottom: 7,
    width: '95%',
    alignSelf: 'center',
  },
});
