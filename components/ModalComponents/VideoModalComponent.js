import React, { useState } from 'react';
import { StyleSheet, View, Text, Modal } from 'react-native';
import { Input, Button } from 'react-native-elements';
import { AntDesign } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

export const VideoModal = ({ createVideo, hasVideo }) => {
  const [videoName, setVideoName] = useState('');
  const [visibleModal, setVisibleModal] = useState(false);
  const { t } = useTranslation();

  return (
    <View style={{ flex: 1, width: '100%' }}>
      <Modal animationType="fade" transparent={true} visible={visibleModal}>
        <View style={styles.modalBackground} onPress={() => setVisibleModal(false)}>
          <View style={styles.modalRoot}>
            <Text allowFontScaling={false} style={styles.title}>
              {hasVideo ? t('simple:updateVideo') : t('simple:addVideo')}
            </Text>
            <Input
              value={videoName}
              onChangeText={setVideoName}
              label={t('simple:linkToVideo')}
              placeholder={t('simple:exmpleVideo')}
            />
            {videoName.length > 16 && videoName.indexOf('https://www.youtube.com/') !== -1 && (
              <Text allowFontScaling={false} style={{ color: 'red', marginLeft: '5%' }}>
                {t('simple:uncorrectVideo')}
              </Text>
            )}

            <View style={styles.buttonsContainer}>
              <Button
                onPress={() => {
                  setVisibleModal(false);
                  createVideo(videoName);
                }}
                disabled={
                  !videoName.length ||
                  (videoName.length > 16 && videoName.indexOf('https://www.youtube.com/') !== -1)
                }
                containerStyle={styles.button}
                title={hasVideo ? t('simple:updateVideo') : t('simple:addVideo')}
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
        title={hasVideo ? t('simple:updateVideo') : t('simple:addVideo')}
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
