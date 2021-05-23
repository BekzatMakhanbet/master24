import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import stylesObject from '../../../constants/style/stylesObject';
import { StyleSheet } from 'react-native';
import { Entypo } from '@expo/vector-icons';
import { Input } from 'react-native-elements';
import getFontSize from '../../../utils/getFontSize';

export const Notes = ({ t, notes, notesValue, edit, setStateValues, popUpInfo }) => {
  return (
    <View style={stylesObject.width100}>
      <View style={styles.childView}>
        <Text allowFontScaling={false} style={styles.labelInfo}>
          {t('profile:aboutMe')}
        </Text>
        <TouchableOpacity
          onPress={() => setStateValues('popUpInfo', !popUpInfo)}
          style={styles.diamond}
        >
          <View
            style={{
              transform: [{ rotate: '-45deg' }],
            }}
          >
            <Entypo
              name={popUpInfo ? 'circle-with-cross' : 'info'}
              size={popUpInfo ? 15 : 12}
              color="white"
            />
          </View>
        </TouchableOpacity>
      </View>
      {notes || edit ? (
        <Input
          multiline={true}
          style={stylesObject.font14}
          value={edit ? notesValue : notes}
          disabled={!edit}
          onChangeText={(text) => {
            setStateValues('notes', text);
          }}
          inputStyle={styles.inputStyle}
          inputContainerStyle={styles.inputContainer}
        />
      ) : (
        <Text allowFontScaling={false} style={styles.noInfo}>
          {t('simple:noInfo')}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  childView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputContainer: {
    width: '100%',
    borderBottomWidth: 0,
  },
  noInfo: {
    textAlign: 'center',
    color: '#b2bdbf',
    fontSize: 16,
    fontWeight: '500',
  },
  labelInfo: {
    textAlign: 'left',
    fontSize: 18,
    fontWeight: '500',
    marginTop: 7,
  },
  diamond: {
    width: 18,
    height: 18,
    backgroundColor: '#c20021',
    transform: [{ rotate: '45deg' }],
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputStyle: {
    fontSize: getFontSize(15),
  },
});
