import { Ionicons } from '@expo/vector-icons';
import { AppLoading, Linking } from 'expo';
import { Asset } from 'expo-asset';
import * as Font from 'expo-font';
import { Root } from 'native-base';
import React, { useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import { Image, Platform, StatusBar, StyleSheet, Text, View } from 'react-native';
import { Provider as ReduxProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import i18n from './i18n';
import AppNavigator from './navigation/AppNavigator';
import { persistor, store } from './store';
import { AppearanceProvider } from 'react-native-appearance';

export default function App(props) {
  const [isLoadingComplete, setLoadingComplete] = useState(false);
  const prefix = Linking.makeUrl('/');

  if (!isLoadingComplete && !props.skipLoadingScreen) {
    return (
      <AppLoading
        startAsync={loadResourcesAsync}
        onError={handleLoadingError}
        onFinish={() => handleFinishLoading(setLoadingComplete)}
      />
    );
  } else {
    return (
      <AppearanceProvider>
        <Root>
          <View style={styles.container}>
            {Platform.OS === 'ios' && <StatusBar barStyle="default" />}
            <ReduxProvider store={store}>
              <PersistGate loading={null} persistor={persistor}>
                <I18nextProvider i18n={i18n}>
                  <AppNavigator uriPrefix={prefix} />
                </I18nextProvider>
              </PersistGate>
            </ReduxProvider>
          </View>
        </Root>
      </AppearanceProvider>
    );
  }
}

async function loadResourcesAsync() {
  const imageAssets = cacheImages([
    require('./assets/images/noNetworkInternetMaster.png'),
    require('./assets/images/noNetworkInternet.png'),
    require('./assets/images/1gif.gif'),
    require('./assets/images/2gif.gif'),
    require('./assets/images/3gif.gif'),
    require('./assets/images/4gif.gif'),
    require('./assets/images/5gif.gif'),
    require('./assets/images/6gif.gif'),
    require('./assets/images/7gif.gif'),
    require('./assets/images/8gif.gif'),
    require('./assets/images/9gif.gif'),
    require('./assets/images/10gif.gif'),
  ]);
  await Promise.all([
    Font.loadAsync({
      // This is the font that we are using for our tab bar
      ...Ionicons.font,
      // We include SpaceMono because we use it in HomeScreen.js. Feel free to
      // remove this if you are not using it in your app
      'space-mono': require('./assets/fonts/SpaceMono-Regular.ttf'),
      Roboto: require('native-base/Fonts/Roboto.ttf'),
      Roboto_medium: require('native-base/Fonts/Roboto_medium.ttf'),
    }),
  ]);
  await Promise.all([...imageAssets]);
}

function cacheImages(images) {
  return images.map((image) => {
    if (typeof image === 'string') {
      return Image.prefetch(image);
    } else {
      return Asset.fromModule(image).downloadAsync();
    }
  });
}

function handleLoadingError(error) {
  // In this case, you might want to report the error to your error reporting
  // service, for example Sentry
  console.warn(error);
}

function handleFinishLoading(setLoadingComplete) {
  setLoadingComplete(true);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
