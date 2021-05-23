import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import getMasterType from '../../../utils/getMasterType';
import RadioForm, {
  RadioButton,
  RadioButtonInput,
  RadioButtonLabel,
} from 'react-native-simple-radio-button';
import stylesObject from '../../../constants/style/stylesObject';
import { Input } from 'react-native-elements';

export const MasterType = ({
  masterType,
  orgName,
  edit,
  t,
  radio_props,
  setStateValues,
  stateMasterType,
  stateOrgName,
}) => {
  return (
    <>
      <View style={styles.view}>
        <Text allowFontScaling={false} style={styles.blockTitle}>
          {t('profile:masterType')}:{' '}
        </Text>
        {!edit ? (
          <Text allowFontScaling={false} style={stylesObject.font500}>
            {getMasterType(masterType)}
          </Text>
        ) : (
          <RadioForm>
            {radio_props.map((obj, i) => (
              <RadioButton style={stylesObject.marginVert10} labelHorizontal={true} key={i}>
                <RadioButtonInput
                  obj={obj}
                  index={i}
                  isSelected={stateMasterType === obj.value}
                  onPress={(value) => {
                    console.log(masterType, obj.value);
                    setStateValues('masterType', value);
                    console.log(masterType, obj.value);
                  }}
                  borderWidth={1}
                  buttonInnerColor={'#c20021'}
                  buttonOuterColor={'#cadadd'}
                  buttonStyle={{}}
                  buttonSize={15}
                />
                <RadioButtonLabel
                  obj={obj}
                  index={i}
                  onPress={(value) => {
                    setStateValues('masterType', value);
                  }}
                  labelHorizontal={true}
                  labelStyle={styles.labelStyle}
                  labelWrapStyle={styles.labelWrapStyle}
                />
              </RadioButton>
            ))}
          </RadioForm>
        )}
      </View>
      {!edit && masterType === 'COMPANY' && (
        <View style={styles.view}>
          <Text allowFontScaling={false} style={styles.blockTitle}>
            {t('profile:orgName')}:{' '}
          </Text>
          <View>
            <Text allowFontScaling={false} style={stylesObject.font500}>
              {orgName}
            </Text>
          </View>
        </View>
      )}
      {stateMasterType === 'COMPANY' && edit && (
        <Input
          inputContainerStyle={styles.inputContainerStyle}
          value={stateOrgName === null ? orgName : stateOrgName}
          onChangeText={(orgNameValue) => setStateValues('orgName', orgNameValue)}
          label={() => (
            <Text allowFontScaling={false} style={styles.orgText}>
              {t('profile:orgName')}
            </Text>
          )}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  view: {
    flexDirection: 'row',
    paddingTop: 10,
  },
  blockTitle: { color: '#b2bdbf', fontWeight: '400' },
  labelStyle: { fontSize: 17, textAlign: 'left' },
  labelWrapStyle: { textAlign: 'left' },
  inputContainerStyle: {
    width: '100%',
    alignSelf: 'center',
    borderBottomWidth: 0,
  },
  orgText: {
    color: '#b2bdbf',
    fontWeight: '400',
    marginLeft: '3%',
  },
});
