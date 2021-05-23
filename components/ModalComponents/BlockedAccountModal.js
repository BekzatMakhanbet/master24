import { Button } from 'native-base';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, Modal, StyleSheet, Text, View } from 'react-native';

const { width, height } = Dimensions.get('window');

export const BlockedAccountModal = ({ visibleModal, closeErrorModal }) => {
  const { t } = useTranslation();

  return (
    visibleModal && (
      <Modal animationType="slide" transparent={true} visible={visibleModal}>
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
            <Text allowFontScaling={false} style={styles.titleTextModal}>
              {t('simple:blockedAcc')}
            </Text>

            <Button onPress={closeErrorModal} style={styles.buttonModal}>
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
                {t('simple:close')}
              </Text>
            </Button>
          </View>
        </View>
      </Modal>
    )
  );
};

const styles = StyleSheet.create({
  modalRoot: {
    width,
    height: height - 20,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 20,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 20,
    marginBottom: 15,
    fontWeight: '500',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#c20021',
    borderRadius: 40,
    padding: 10,
  },
  icon: {
    width: 56,
    height: 56,
    alignSelf: 'center',
  },
  buttonsContainer: {
    paddingBottom: 40,
  },
  titleTextModal: {
    fontSize: 20,
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
  buttonModal: {
    backgroundColor: '#c20021',
    width: '100%',
    alignItems: 'center',
    textAlign: 'center',
    marginVertical: 5,
  },
});
