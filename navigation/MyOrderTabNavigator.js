import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import { Image, Text, View } from 'react-native';
import { createBottomTabNavigator, createStackNavigator } from 'react-navigation';
import LabelsWithCount from '../components/LabelsWithCount';
import i18n from '../i18n';
import MarketBySpecs from '../screens/Market/MarketBySpecs';
import MarketFilter from '../screens/Market/MarketFilter';
import MarketMain from '../screens/Market/MarketMain';
import MasterProfileForClient from '../screens/Master/MasterProfileForClient';
import MastersBySpecs from '../screens/Master/MastersBySpecs';
import Home from '../screens/OrderScreen/HomeScreen';
import { store } from '../store';
import { getModeColor } from '../utils/getModeColor';
import config from './config';
import styles from './styles';

const MastersBySpecializations = createStackNavigator(
  {
    Links: MastersBySpecs,
    MasterProfileForClientBySpec: MasterProfileForClient,
    MarketMainProfileClientBySpec: MarketMain,
  },
  config,
);

MastersBySpecializations.navigationOptions = ({ navigation }) => {
  const { specName } = store.getState().mastersOrderSpec;

  let tabBarVisible;
  if (navigation.state.routes.length > 1 || specName === 'notShow') {
    tabBarVisible = false;
  }

  return {
    tabBarVisible,
    tabBarLabel: ({ focused }) => (
      <Text allowFontScaling={false} style={focused ? styles.focused : styles.notFocused}>
        {i18n.t('order:masters')}
      </Text>
    ),
    tabBarIcon: ({ focused }) => (
      <View>
        <FontAwesome size={22} name={'users'} color={focused ? '#c20021' : '#999999'} />
        <LabelsWithCount focused={focused} mode={'master'} />
      </View>
    ),
  };
};

const MarketStackBySpecs = createStackNavigator(
  {
    Settings: MarketBySpecs,
    MarketMain,
    MarketFilter,
  },
  config,
);

MarketStackBySpecs.navigationOptions = ({ navigation }) => {
  const { mode } = store.getState().modeReducer;
  const { specName } = store.getState().mastersOrderSpec;

  let tabBarVisible;
  if (navigation.state.routes.length > 1 || specName === 'notShow') {
    navigation.state.routes.map((route) => {
      if (route.routeName === 'MarketMain' || route.routeName === 'MarketFilter') {
        tabBarVisible = false;
      } else {
        tabBarVisible = true;
      }
    });
  }
  return {
    tabBarLabel: ({ focused }) => (
      <Text
        allowFontScaling={false}
        style={
          focused
            ? mode === 'master'
              ? styles.focusedMaster
              : styles.focused
            : mode === 'master'
            ? styles.notFocusedMaster
            : styles.notFocused
        }
      >
        {i18n.t('order:markets')}
      </Text>
    ),
    tabBarIcon: ({ focused }) => (
      <View>
        <Image
          source={require('../assets/images/Товары.png')}
          style={{
            width: 26,
            height: 26,
            tintColor: focused ? getModeColor(mode) : '#999999',
          }}
        />
        <LabelsWithCount focused={focused} mode={'market'} />
      </View>
    ),
    tabBarVisible,
  };
};

const tabNavigator = createBottomTabNavigator(
  {
    Home,
    MastersBySpecializations,
    MarketStackBySpecs,
  },
  {
    tabBarOptions: {
      style: {
        height: 75,
      },
      tintColor: '#c20021',
    },
  },
);

export default tabNavigator;
