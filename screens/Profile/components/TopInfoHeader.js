import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';

export const TopInfoHeader = ({ viewCount = 0, reviewsLength = 0, histCallCount = 0 }) => {
  return (
    <View style={styles.parentView}>
      <View style={styles.childView}>
        <Text allowFontScaling={false} style={styles.icons}>
          <MaterialCommunityIcons
            style={styles.icnonsMargin}
            name="eye"
            size={16}
            color="#b2bdbf"
          />{' '}
          <Text allowFontScaling={false} style={styles.iconText}>
            {viewCount}
          </Text>
        </Text>
        <Text allowFontScaling={false} style={styles.icons}>
          <FontAwesome style={styles.icnonsMargin} name="phone" size={16} color="#b2bdbf" />{' '}
          <Text allowFontScaling={false} style={styles.iconText}>
            {histCallCount}
          </Text>
        </Text>
        <Text allowFontScaling={false} style={styles.icons}>
          <MaterialCommunityIcons
            style={styles.icnonsMargin}
            name="message-reply"
            size={16}
            color="#b2bdbf"
          />{' '}
          <Text allowFontScaling={false} style={styles.iconText}>
            {reviewsLength}
          </Text>
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  parentView: { backgroundColor: '#e9f0f4', paddingHorizontal: '5%' },
  childView: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flexWrap: 'nowrap',
    paddingVertical: 10,
  },
  icnonsMargin: { marginRight: 5 },
  iconText: {
    color: '#b2bdbf',
    fontSize: 16,
    marginLeft: 5,
  },
  icons: {
    width: '17%',
    textAlign: 'right',
  },
});
