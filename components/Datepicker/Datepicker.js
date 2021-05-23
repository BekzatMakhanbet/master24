import React from 'react';
import { Platform, Modal, View, Text, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'react-native-appearance';

export const Datepicker = ({ show, setShow, value, onChange, disabled }) => {
  const { t } = useTranslation();
  let colorScheme = useColorScheme();

  return Platform.OS === 'ios' ? (
    <Modal animationType="slide" transparent={true} visible={show} onPress={() => setShow(false)}>
      <View
        style={{
          width: '100%',
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          paddingBottom: 20,
          backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.84)',
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
            backgroundColor: colorScheme === 'dark' ? 'rgba(0,0,0,0.84)' : '#fff',
          }}
        >
          <View style={{ width: '100%', height: 300 }}>
            <DateTimePicker
              locale="ru"
              mode="date"
              disabled={disabled}
              value={value}
              style={{ color: 'black', textColor: 'black', flex: 1 }}
              onChange={onChange}
            />
          </View>
          <TouchableOpacity onPress={() => setShow(false)} style={styles.exitButton}>
            <Text allowFontScaling={false} style={styles.exitText}>
              {t('simple:close')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  ) : (
    show && (
      <DateTimePicker
        locale="ru"
        mode="date"
        disabled={disabled}
        value={value}
        style={{ color: 'red' }}
        onChange={onChange}
      />
    )
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
