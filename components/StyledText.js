import React from 'react';
import { Text } from 'react-native';

export function MonoText(props) {
  return <Text allowFontScaling={false} {...props} style={[props.style, {}]} />;
}
