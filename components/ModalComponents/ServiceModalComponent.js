import { AntDesign } from '@expo/vector-icons';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, StyleSheet, Text, View } from 'react-native';
import { Button, Input } from 'react-native-elements';

export const ServiceModal = ({ createService }) => {
  const [serviceName, setServiceName] = useState('');
  const [price, setPrice] = useState(0);
  const [unit, setUnit] = useState('');
  const [visibleModal, setVisibleModal] = useState(false);
  const { t } = useTranslation();

  return (
    <View style={{ flex: 1, width: '100%' }}>
      <Modal animationType="fade" transparent={true} visible={visibleModal}>
        <View style={styles.modalBackground} onPress={() => setVisibleModal(false)}>
          <View style={styles.modalRoot}>
            <Text allowFontScaling={false} style={styles.title}>
              {t('simple:addService')}
            </Text>
            <Input
              value={serviceName}
              onChangeText={setServiceName}
              label={t('simple:serviceName')}
            />

            <Input
              keyboardType="numeric"
              value={price}
              onChangeText={(text) => {
                if (/^\d+$/.test(text) || text === '') {
                  setPrice(text);
                }
              }}
              label={t('simple:price')}
            />

            <Input value={unit} onChangeText={setUnit} label={t('simple:metrics')} />
            <View style={styles.buttonsContainer}>
              <Button
                onPress={() => {
                  setVisibleModal(false);
                  createService({ name: serviceName, cost: price, unit });
                }}
                disabled={!serviceName || !price || !unit}
                containerStyle={styles.button}
                title={t('simple:create')}
              />
              <Button
                onPress={() => setVisibleModal(false)}
                title={t('simple:cancel')}
                type="outline"
              />
            </View>
          </View>
        </View>
      </Modal>
      <Button
        containerStyle={styles.button}
        onPress={() => {
          setVisibleModal(true);
        }}
        title={t('simple:addServiceAndPrice')}
        icon={<AntDesign color="white" name="plus" size={22} />}
      />
    </View>
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
  button: {
    backgroundColor: '#0288c7',
    marginVertical: 7,
  },
});
