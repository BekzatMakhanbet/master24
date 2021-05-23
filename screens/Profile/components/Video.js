import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Entypo } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';

export const Video = ({ videos, t, setStateValues, popUpInfo2 }) => {
  return (
    <>
      <View style={styles.view}>
        <Text allowFontScaling={false} style={styles.labelInfo}>
          Видео ({videos ? videos.length : 0})
        </Text>
        <TouchableOpacity
          onPress={() => setStateValues('popUpInfo2', !popUpInfo2)}
          style={styles.diamond}
        >
          <View
            style={{
              transform: [{ rotate: '-45deg' }],
            }}
          >
            <Entypo
              name={popUpInfo2 ? 'circle-with-cross' : 'info'}
              size={popUpInfo2 ? 15 : 12}
              color="white"
            />
          </View>
        </TouchableOpacity>
      </View>
      <Text allowFontScaling={false} style={styles.videoHelps}>
        {t('profile:videoHelps')}
      </Text>
      {videos.length ? (
        <WebView
          source={{
            uri: `https://www.youtube.com/embed/${videos[0].link.substring(
              videos[0].link.lastIndexOf('/') + 1,
              videos[0].link.length,
            )}`,
          }}
          useWebKit={true}
          style={styles.video}
        />
      ) : (
        <View style={styles.noVideoView}>
          <Text allowFontScaling={false} style={styles.noVideoText}>
            {t('simple:noVideo')}
          </Text>
          <Text allowFontScaling={false} style={styles.pressToEdit}>
            {t('simple:pressToEdit')}
          </Text>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  view: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  videoHelps: { color: '#b2bdbf', fontWeight: '400' },
  video: {
    marginTop: 20,
    width: '95%',
    height: 220,
    alignSelf: 'center',
  },
  noVideoView: { marginVertical: 15 },
  noVideoText: {
    textAlign: 'center',
    color: '#b2bdbf',
    fontSize: 16,
    fontWeight: '500',
  },
  pressToEdit: {
    textAlign: 'center',
    color: '#b2bdbf',
    fontSize: 14,
  },
});
