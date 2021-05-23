import React, { useState } from 'react';
import { Feather } from '@expo/vector-icons';
import { Modal, TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Input } from 'react-native-elements';
import { DatePicker, Label, Button } from 'native-base';
import RadioForm, {
  RadioButton,
  RadioButtonInput,
  RadioButtonLabel,
} from 'react-native-simple-radio-button';
import getOrderPrice from '../../utils/getOrderPrice';

const OrderPriceEditer = ({ orderPriceType, price, t, setOrderPriceType, setPrice }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [value2, setValue2] = useState(orderPriceType);
  const [FIXED, setFixedPrice] = useState(price);
  const [UP_TO, setLimitedPrice] = useState(price);

  const typesObject = { FIXED, UP_TO };

  const textChange = (text, value) => {
    if (value === 'FIXED') {
      setFixedPrice(text);
      setPrice(text);
    } else if (value === 'UP_TO') {
      setLimitedPrice(text);
      setPrice(text);
    }
  };

  var radio_props2 = [
    { label: t('createOrder:fixedPrice'), value: 'FIXED' },
    { label: t('createOrder:maxPrice'), value: 'UP_TO' },
    { label: t('createOrder:solveWithMasterMoney'), value: 'CONTRACTUAL' },
  ];

  let disabled;

  if (value2 === 'FIXED' && FIXED === '') {
    disabled = true;
  }
  if (value2 === 'UP_TO' && UP_TO === '') {
    disabled = true;
  }

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <View>
          <Label style={styles.inputLabel2}>{t('createOrder:givePrice')}</Label>
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            style={{
              flexDirection: 'row',
              width: '100%',
              justifyContent: 'space-between',
              marginTop: 10,
            }}
          >
            <Text allowFontScaling={false} style={{ fontSize: 16 }}>
              {getOrderPrice(orderPriceType, price)}
            </Text>
            <Feather name="chevron-right" size={26} color="#999999" />
          </TouchableOpacity>
        </View>
      </View>
      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <View
          style={{
            width: '100%',
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            paddingBottom: 20,
            backgroundColor: 'rgba(0,0,0,0.84)',
          }}
        >
          <View
            style={{
              width: '80%',
              paddingHorizontal: 30,
              paddingVertical: 15,
              borderRadius: 10,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: '#fff',
            }}
          >
            <Text allowFontScaling={false} style={styles.titleText}>
              {t('createOrder:givePrice')}
            </Text>
            <RadioForm initial={0}>
              {radio_props2.map((obj, i) => (
                <RadioButton
                  style={{ marginVertical: 20 }}
                  labelHorizontal={true}
                  key={i}
                  onPress={() => {
                    setValue2(obj.value);
                    setOrderPriceType(obj.value);
                  }}
                >
                  {/*  You can set RadioButtonLabel before RadioButtonInput */}
                  <RadioButtonInput
                    obj={obj}
                    index={i}
                    isSelected={value2 === obj.value}
                    onPress={(value2) => {
                      setValue2(value2);
                      setOrderPriceType(value2);
                    }}
                    borderWidth={1}
                    buttonInnerColor={'#c20021'}
                    buttonOuterColor={'#cadadd'}
                    buttonStyle={{}}
                    buttonSize={15}
                  />
                  <View>
                    <RadioButtonLabel
                      obj={obj}
                      index={i}
                      labelHorizontal={true}
                      onPress={(value2) => {
                        setValue2(value2);
                        setOrderPriceType(value2);
                      }}
                      labelStyle={{ fontSize: 17, textAlign: 'left' }}
                      labelWrapStyle={{ textAlign: 'left' }}
                    />
                    {i < 2 && (
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'flex-end',
                          width: 100,
                        }}
                      >
                        <Input
                          maxLength={8}
                          onChangeText={(text) => textChange(text, obj.value)}
                          value={value2 == obj.value ? typesObject[obj.value] + '' : ''}
                          keyboardType="numeric"
                          disabled={value2 !== obj.value}
                          inputContainerStyle={{ height: 30 }}
                          inputStyle={{ fontSize: 18 }}
                        />
                        <Text allowFontScaling={false}>тг</Text>
                      </View>
                    )}
                  </View>
                </RadioButton>
              ))}
            </RadioForm>
            <Button
              onPress={() => setModalVisible(false)}
              style={{
                backgroundColor: disabled ? '#cadadd' : '#c20021',
                width: '100%',
                alignItems: 'center',
                textAlign: 'center',
                marginVertical: 5,
              }}
              disabled={disabled}
            >
              <Text
                allowFontScaling={false}
                style={{
                  width: '100%',
                  color: '#fff',
                  textAlign: 'center',
                  fontSize: 16,
                  fontWeight: '500',
                }}
              >
                {t('createOrder:continuneButton')}
              </Text>
            </Button>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '94%',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  titleText: {
    fontSize: 19,
    fontWeight: '500',
    marginVertical: 10,
  },
  describeText: {
    fontSize: 14,
    color: '#999999',
    paddingVertical: 7,
  },
  buttonText: {
    color: '#c20021',
    fontSize: 13,
    fontWeight: '500',
  },
  buttonModal: {
    backgroundColor: '#c20021',
    width: '100%',
    alignItems: 'center',
    textAlign: 'center',
    marginVertical: 5,
  },
  titleTextModal: {
    fontSize: 24,
    marginBottom: 10,
    fontWeight: '600',
    width: '100%',
    textAlign: 'center',
  },
  describeTextModal: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  continuneText: {
    fontSize: 17,
    fontWeight: '500',
    color: '#fff',
  },
  inputContainer: {
    borderBottomWidth: 1,
    width: '95%',
    borderBottomColor: '#8b998f',
    marginVertical: 1,
  },
  inputLabel2: {
    fontSize: 13,
    color: '#8b998f',
    marginLeft: 2,
    fontWeight: '500',
  },
});

export default OrderPriceEditer;
