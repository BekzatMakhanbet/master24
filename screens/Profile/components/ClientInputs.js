import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Modal } from 'react-native';
import { Input } from 'react-native-elements';
import { Picker, Header, Button, Title, DatePicker } from 'native-base';
import getNamesLocal from '../../../utils/getNamesLocal';
import stylesObject from '../../../constants/style/stylesObject';
import getFontSize from '../../../utils/getFontSize';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Datepicker } from '../../../components/Datepicker/Datepicker';

export const ClientInputs = ({ edit, cities, setStateValues, t, stateValues, values }) => {
  const [date, setDate] = useState(new Date(values?.birthday));
  const [show, setShow] = useState(false);

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShow(Platform.OS === 'ios');
    setDate(currentDate);
    setStateValues('birthday', currentDate);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.inputContainer, stylesObject.defaultFlexRowCentered]}>
        <Text allowFontScaling={false} style={stylesObject.defaultColorRed}>
          *
        </Text>
        <Input
          disabled={!edit}
          inputContainerStyle={styles.noBottomBorder}
          underlined={false}
          value={edit ? stateValues.name : values.name}
          onChangeText={(nameValue) => setStateValues('name', nameValue)}
        />
      </View>
      <Input
        inputStyle={styles.input}
        disabled={!edit}
        value={edit ? stateValues.surname : values.surname}
        onChangeText={(surnameValue) => setStateValues('surname', surnameValue)}
      />
      <View style={[styles.inputContainer, stylesObject.defaultFlexRowCentered]}>
        <Text allowFontScaling={false} style={stylesObject.defaultColorRed}>
          *
        </Text>
        <Picker
          headerBackButtonText={t('simple:back')}
          iosHeader={t('simple:choose')}
          enabled={edit}
          leftIcon={
            <Text allowFontScaling={false} style={stylesObject.defaultColorRed}>
              *
            </Text>
          }
          selectedValue={edit ? stateValues.sex : values.sex}
          onValueChange={(sexValue) => setStateValues('sex', sexValue)}
        >
          <Picker.Item label={t('login:male')} value="M" />
          <Picker.Item label={t('login:female')} value="F" />
        </Picker>
      </View>

      {values.birthday && (
        <View
          style={[
            styles.inputContainer,
            stylesObject.defaultFlexRowCentered,
            { paddingBottom: 10 },
          ]}
        >
          <Text allowFontScaling={false} style={[stylesObject.defaultColorRed, { paddingTop: 10 }]}>
            *
          </Text>
          <Text
            onPress={() => edit && setShow(true)}
            style={[styles.input, { fontSize: getFontSize(17) }]}
          >
            {moment(date).format('DD/MM/YYYY')}
          </Text>
          <View style={{ width: '100%' }}>
            <Datepicker
              show={show}
              setShow={setShow}
              value={date}
              onChange={onChange}
              disabled={!edit}
            />
          </View>
        </View>
      )}

      <TouchableOpacity
        style={{
          borderBottomWidth: 1,
          width: '95%',
          alignSelf: 'center',
          paddingBottom: 10,
          borderBottomColor: '#a8adaa',
        }}
        onPress={() => edit && setStateValues('changeMobileNumber', true)}
      >
        <Text
          style={[
            styles.input,

            edit
              ? { color: 'black', opacity: 1, fontSize: getFontSize(16) }
              : { fontSize: getFontSize(16), opacity: 0.5 },
          ]}
        >{`+7 ${values.phoneNumber}`}</Text>
      </TouchableOpacity>
      <View style={[styles.inputContainer, stylesObject.defaultFlexRowCentered]}>
        <Text allowFontScaling={false} style={stylesObject.defaultColorRed}>
          *
        </Text>
        <Picker
          headerBackButtonText={t('simple:back')}
          iosHeader={t('simple:choose')}
          enabled={edit}
          selectedValue={
            stateValues.city && stateValues.city.id ? stateValues.city.id : stateValues.city
          }
          onValueChange={(newCity) => {
            setStateValues('city', newCity);
          }}
        >
          {cities.map((cityElem, index) => (
            <Picker.Item
              key={index}
              label={getNamesLocal(cityElem.cityName, cityElem.cityNameKz)}
              value={cityElem.id}
            />
          ))}
        </Picker>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flex: 1,
  },
  input: {
    paddingLeft: 10,
    color: 'black',
    marginTop: 10,
  },
  inputContainer: {
    borderBottomWidth: 1,
    alignSelf: 'center',
    width: '95%',
    borderBottomColor: '#8b998f',
    marginVertical: 3,
  },
  onePicker: {
    width: '100%',
    borderWidth: 1,
  },
  onePickerItem: {
    width: '100%',
  },
  noBottomBorder: { borderBottomWidth: 0 },
  exitButton: {
    alignSelf: 'center',
    marginBottom: 50,
    flexDirection: 'row',
  },
  exitText: {
    color: '#c20021',
    fontSize: 18,
    fontWeight: '400',
  },
});
