import React from 'react';
import { connect } from 'react-redux';
import { Text } from 'react-native';
import { getModeColor } from '../utils/getModeColor';

const Label = ({ mastersOrderSpec, modeReducer, focused, mode }) => {
  return (
    <Text
      allowFontScaling={false}
      style={{
        color: focused ? getModeColor(modeReducer.mode) : '#999999',
        position: 'absolute',
        top: -5,
        left: 30,
      }}
    >
      {mastersOrderSpec[`${mode}Count`]}
    </Text>
  );
};

export default connect(
  ({ mastersOrderSpec, modeReducer }) => ({ mastersOrderSpec, modeReducer }),
  {},
)(Label);
