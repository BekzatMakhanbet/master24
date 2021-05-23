import React from 'react';
import { TabHeading } from 'native-base';
import { Text } from 'react-native';
import { StyleSheet } from 'react-native';

export default (text, count, activeTab, myPos) => (
  <TabHeading style={styles.heading}>
    <Text
      allowFontScaling={false}
      style={activeTab === myPos ? styles.activeTab : styles.inActiveTab}
    >
      {text}{' '}
      <Text allowFontScaling={false} style={styles.text}>
        ({count})
      </Text>
    </Text>
  </TabHeading>
);

const styles = StyleSheet.create({
  heading: { backgroundColor: '#e9f0f4', height: 50 },
  activeTab: {
    color: 'black',
    fontWeight: '500',
  },
  inActiveTab: {
    color: '#999999',
    fontWeight: '500',
  },
  text: { color: '#c20021', fontWeight: '500' },
});
