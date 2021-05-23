import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import getNamesLocal from '../../../utils/getNamesLocal';

export const Specs = ({ specializations = [] }) => {
  return (
    <View style={styles.view}>
      <Text allowFontScaling={false} style={styles.specsText}>
        Специализация:{' '}
      </Text>
      <View style={styles.childView}>
        {specializations.map(({ specName, specNameKz }, index) => (
          <Text allowFontScaling={false} key={index} style={styles.specText}>
            {getNamesLocal(specName, specNameKz)}
          </Text>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  view: {
    paddingTop: 10,
    paddingBottom: 15,
  },
  specsText: { color: '#b2bdbf', fontWeight: '400' },
  childView: { marginLeft: 10 },
  specText: { fontWeight: '500' },
});
