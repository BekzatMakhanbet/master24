import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import { Image, Text, View } from 'react-native';
import { createBottomTabNavigator, createStackNavigator } from 'react-navigation';
import LabelsWithCount from '../components/LabelsWithCount';
import i18n from '../i18n';
import MarketFilter from '../screens/Market/MarketFilter';
import MarketListScreen from '../screens/Market/MarketListScreen';
import MarketMain from '../screens/Market/MarketMain';
import OrderListMaster from '../screens/OrderListMaster/OrderListMaster';
import OrderMainMaster from '../screens/OrderListMaster/OrderMainMaster';
import PromosListMaster from '../screens/OrderListMaster/PromosListMaster';
import { store } from '../store';
import { getModeColor } from '../utils/getModeColor';
import config from './config';
import styles from './styles';

const SettingsStack = createStackNavigator(
  {
    Settings: MarketListScreen,
    MarketMain: MarketMain,
    MarketFilter: MarketFilter,
  },
  config,
);

SettingsStack.navigationOptions = ({ navigation }) => {
  const { mode } = store.getState().modeReducer;
  let tabBarVisible;
  if (navigation.state.routes.length > 1) {
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
        {i18n.t('order:allMarkets')}
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
        <LabelsWithCount focused={focused} mode={'allMarket'} />
      </View>
    ),
    tabBarVisible,
  };
};

const ListOrdersMaster = createStackNavigator(
  {
    OrderListMaster: OrderListMaster,
    OrderMainMaster: OrderMainMaster,
    MarketIntoMasterOrder: MarketMain,
  },
  config,
);

ListOrdersMaster.navigationOptions = ({ navigation }) => {
  let tabBarVisible;
  if (navigation.state.routes.length > 1) {
    tabBarVisible = false;
  }

  const visible = navigation.state.routes[0].params
    ? navigation.state.routes[0].params.visible
    : true;

  return {
    tabBarVisible: visible && tabBarVisible,
    tabBarLabel: ({ focused }) => (
      <Text
        allowFontScaling={false}
        style={focused ? styles.focusedMaster : styles.notFocusedMaster}
      >
        {i18n.t('order:orders1')}
      </Text>
    ),
    tabBarIcon: ({ focused }) => (
      <Image
        source={require('../assets/images/Заказы.png')}
        style={{
          width: 26,
          height: 26,
          tintColor: focused ? '#0288c7' : '#999999',
        }}
      />
    ),
  };
};

const PromosStack = createStackNavigator(
  {
    Promos: PromosListMaster,
  },
  config,
);

PromosStack.navigationOptions = ({ navigation }) => {
  const { mode } = store.getState().modeReducer;
  let tabBarVisible;
  if (navigation.state.routes.length > 1) {
    tabBarVisible = false;
  }

  return {
    tabBarVisible,
    tabBarLabel: ({ focused }) => (
      <Text
        allowFontScaling={false}
        style={focused ? styles.focusedMaster : styles.notFocusedMaster}
      >
        {i18n.t('simple:promos')}
      </Text>
    ),
    tabBarIcon: ({ focused }) => (
      <FontAwesome size={22} name={'bullhorn'} color={focused ? getModeColor(mode) : '#999999'} />
    ),
  };
};

const masterOrderListTabNavigator = createBottomTabNavigator(
  {
    ListOrdersMaster,
    PromosStack,
    SettingsStack,
  },
  {
    tabBarOptions: {
      style: {
        height: 70,
      },
      tintColor: '#0288c7',
    },
  },
);

export default masterOrderListTabNavigator;
