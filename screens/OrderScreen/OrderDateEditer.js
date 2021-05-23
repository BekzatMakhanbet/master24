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
import getOrderDate from '../../utils/getOrderDate';

const OrderDateEditer = ({ urgency, urgencyDate, t, setUrgency, setUrgencyDate }) => {
  const [modalVisible, setModalVisible] = useState(false);

  var radio_props2 = [
    { label: t('createOrder:urgent'), value: 'URGENTLY' },
    { label: t('createOrder:solveWithMaster'), value: 'WITH_MASTER' },
    { label: t('createOrder:calendar'), value: 'POINT_DATE' },
  ];

  let disabled;

  if (urgency === 'POINT_DATE' && urgencyDate === '') {
    disabled = true;
  }

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <View>
          <Label style={styles.inputLabel2}>{t('createOrder:whenToStart')}</Label>
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
              {getOrderDate(urgency, urgencyDate)}
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
                  style={{ marginVertical: 10 }}
                  labelHorizontal={true}
                  key={i}
                  onPress={(value) => setUrgency(value)}
                >
                  {/*  You can set RadioButtonLabel before RadioButtonInput */}
                  <RadioButtonInput
                    obj={obj}
                    onPress={(value) => setUrgency(value)}
                    index={i}
                    isSelected={urgency === obj.value}
                    borderWidth={1}
                    buttonInnerColor={'#c20021'}
                    buttonOuterColor={'#cadadd'}
                    buttonStyle={{}}
                    buttonSize={15}
                  />
                  <View>
                    {i == 2 ? (
                      <DatePicker
                        locale={'ru'}
                        placeHolderText={obj.label}
                        placeHolderTextStyle={{
                          fontSize: 17,
                          textAlign: 'left',
                          marginTop: -10,
                        }}
                        textStyle={{
                          fontSize: 17,
                          textAlign: 'left',
                          marginTop: -10,
                        }}
                        onDateChange={setUrgencyDate}
                      />
                    ) : (
                      <RadioButtonLabel
                        obj={obj}
                        index={i}
                        onPress={(value) => setUrgency(value)}
                        labelHorizontal={true}
                        labelStyle={{ fontSize: 17, textAlign: 'left' }}
                        labelWrapStyle={{ textAlign: 'left' }}
                      />
                    )}
                  </View>
                </RadioButton>
              ))}
            </RadioForm>
            <Button
              onPress={() => setModalVisible(false)}
              style={styles.buttonModal}
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
    marginVertical: 15,
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

export default OrderDateEditer;
