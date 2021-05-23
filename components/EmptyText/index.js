import React from 'react';
import { View, Text } from 'react-native';

export default ({ text }) => {
  return (
    <View
      style={{
        width: '90%',
        height: 240,
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Text
        allowFontScaling={false}
        style={{
          fontSize: 16,
          fontWeight: '500',
          marginVertical: 20,
          color: '#999999',
          textAlign: 'center',
        }}
      >
        {text}
      </Text>
    </View>
  );
};
