import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import stylesObject from '../../../constants/style/stylesObject';
import { Badge } from 'native-base';

export const OnlineBadge = ({}) => {
  return (
    <View style={[styles.view, stylesObject.defaultWidth100Centered]}>
      <Badge success style={styles.badge}>
        <Text allowFontScaling={false} style={styles.text}>
          online
        </Text>
      </Badge>
    </View>
  );
};

const styles = StyleSheet.create({
  text: {
    textAlign: 'center',
    color: 'white',
    fontSize: 16,
    paddingHorizontal: 5,
  },
  badge: { backgroundColor: '#32cd32', alignSelf: 'center' },
  view: {
    marginVertical: '4%',
  },
});
