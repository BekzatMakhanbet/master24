import axios from 'axios';
import { Button, Form, Item, Spinner } from 'native-base';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, Keyboard, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Input } from 'react-native-elements';
import { store } from '../../store';
import config from '../../config/config';

export const ChangeMobilePhone = ({ visible, refresh, closeModal }) => {
  const [phoneNumber, onChangePhoneNumber] = useState('');
  const [mode, setmode] = useState(false);
  const [code, setcode] = useState('');
  const [spinning, setSpinning] = useState(false);
  const [uncorrectCode, setUncorrectCode] = useState(false);
  const { t } = useTranslation();

  const sendCodeMessage = () => {
    setSpinning(true);
    axios
      .post(`${config.url}/api/v1/auth/${phoneNumber}/code`)
      .then((res) => {
        setmode(true);
        setSpinning(false);
      })
      .catch(() => {
        console.log('отправка');
        setSpinning(false);
      });
  };

  const checkSmsCode = () => {
    setSpinning(true);

    axios
      .get(`${config.url}/api/v1/auth/code/verify?code=${code}&&username=${phoneNumber}`)
      .then((res) => {
        const { id } = store.getState().authReducer;
        axios({
          method: 'PUT',
          url: `${config.url}/api/v1/user/username/${id}?number=${phoneNumber}`,
        })
          .then(() => {
            closeModal();
            refresh(phoneNumber);
          })
          .catch(() => console.log('при обнове', id, phoneNumber));
      })
      .catch(() => {
        setUncorrectCode(true);
        setcode('');
        setSpinning(false);
      });
  };

  const onChangeCode = (val) => {
    if (val.length <= 4) {
      setcode(val);
      if (val.length === 4) {
        Keyboard.dismiss();
        checkSmsCode();
      }
    }
  };

  return (
    <Modal animationType="fade" transparent={true} visible={visible}>
      <View style={styles.modalBackground}>
        {spinning ? (
          <Spinner />
        ) : (
          <View style={styles.modalRoot}>
            {mode ? (
              <>
                <Form
                  style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: 10,
                  }}
                >
                  <Item underline={false} style={{ textAlign: 'center', borderBottomWidth: 0 }}>
                    <Input
                      keyboardType="numeric"
                      onChangeText={(val) => onChangeCode(val)}
                      value={code}
                      style={[
                        {
                          textAlign: 'center',
                          fontSize: 18,
                          borderBottomWidth: 0,
                          borderBottomColor: '#999999',
                        },
                        code.length && { letterSpacing: 5 },
                      ]}
                      placeholder={'Введите код'}
                    />
                  </Item>
                </Form>
                {uncorrectCode && (
                  <View>
                    <Text style={styles.uncorrectNumber}>{t('login:uncorrectCodeTryAgain')}</Text>
                  </View>
                )}
                <TouchableOpacity onPress={() => setmode(false)}>
                  <Text style={styles.uncorrectNumber}>{t('login:uncorrectNumber')} ?</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Form style={{ justifyContent: 'center', alignItems: 'center' }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      width: '80%',
                      justifyContent: 'center',
                    }}
                  >
                    <Image
                      source={require('../../assets/images/kazakhstan-flag-icon-32.png')}
                      fadeDuration={0}
                      style={{
                        width: 35,
                        height: 25,
                        borderRadius: 3,
                        marginRight: 5,
                      }}
                    />
                    <Text style={{ fontSize: 17, marginRight: 3 }}>+7</Text>

                    <Input
                      keyboardType="numeric"
                      onChangeText={(val) => onChangePhoneNumber(val)}
                      value={phoneNumber}
                      style={{
                        textAlign: 'left',
                        borderBottomWidth: 1,
                        borderBottomColor: '#999999',
                      }}
                      placeholder={t('login:yourPhoneNumber')}
                    />
                  </View>
                </Form>

                <View style={styles.buttonsContainer}>
                  <Button
                    onPress={() => {
                      sendCodeMessage();
                    }}
                    disabled={phoneNumber.length < 10}
                    style={{
                      backgroundColor:
                        store.getState().modeReducer.mode === 'master' ? '#0288c7' : '#c20021',
                      marginBottom: 7,
                    }}
                  >
                    <Text
                      style={{
                        width: '100%',
                        color: '#fff',
                        textAlign: 'center',
                        fontSize: 15,
                        fontWeight: '500',
                      }}
                    >
                      {t('simple:change')}
                    </Text>
                  </Button>
                  <Button onPress={closeModal} light>
                    <Text
                      style={{
                        width: '100%',
                        color:
                          store.getState().modeReducer.mode === 'master' ? '#0288c7' : '#c20021',
                        textAlign: 'center',
                        fontSize: 15,
                        fontWeight: '500',
                      }}
                    >
                      {t('simple:cancel')}
                    </Text>
                  </Button>
                </View>
              </>
            )}
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 20,
    backgroundColor: 'rgba(0,0,0,0.84)',
  },
  modalRoot: {
    width: '80%',
    backgroundColor: '#fff',
    paddingVertical: 40,
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonsContainer: {
    marginTop: 15,
  },
  buttonSecond: {
    backgroundColor: store.getState().modeReducer.mode === 'master' ? '#999999' : '#999999',
  },
  enterText: {
    fontWeight: '500',
    fontSize: 20,
    marginBottom: 20,
    maxWidth: '90%',
    textAlign: 'center',
  },
  aggreementText: {
    color: '#999999',
    textAlign: 'center',
    paddingVertical: 30,
  },
  uncorrectNumber: {
    textAlign: 'center',
    color: '#c20021',
    paddingVertical: 15,
    fontSize: 16,
  },
});
