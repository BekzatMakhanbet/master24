import React from 'react';
import { Platform } from 'react-native';
import {
  createDrawerNavigator,
  createStackNavigator,
  createSwitchNavigator,
} from 'react-navigation';
import DrawerComponent from '../components/DrawerNavigation/DrawerComponent';
import Layout from '../constants/Layout';
import i18n from '../i18n';
import AboutApp from '../screens/ConfigurationsScreens/AboutApp';
import Confidential from '../screens/ConfigurationsScreens/Confidential';
import ConfigurationScreen from '../screens/ConfigurationsScreens/ConfigurationScreen';
import UserAgreement from '../screens/ConfigurationsScreens/UserAgreement';
import CreateOrderFour from '../screens/CreateOrder/CreateOrderFour';
import CreateOrderScreen from '../screens/CreateOrder/CreateOrderScreen';
import CreateOrderSecond from '../screens/CreateOrder/CreateOrderSecond';
import CreateOrderThree from '../screens/CreateOrder/CreateOrderThree';
import FAQ from '../screens/HowItWorks/FAQ';
import HowItWorksListScreen from '../screens/HowItWorks/HowItWorksListScreen';
import SendQuestionScreen from '../screens/HowItWorks/SendQuestionScreen';
import LogInClient from '../screens/Login/LogInClient';
import RegisterClient from '../screens/Login/RegisterClient';
import MarketMain from '../screens/Market/MarketMain';
import MasterProfileForClient from '../screens/Master/MasterProfileForClient';
import RegisterMaster from '../screens/MasterRegistration/MasterRegistration';
import SpecList from '../screens/MasterRegistration/SpecList';
import SpecListProfile from '../screens/MasterRegistration/SpecListProfile';
import NewsMainScreen from '../screens/News/NewsMain';
import NewsScreen from '../screens/News/NewsScreen';
import NotificationsScreen from '../screens/Notifications/NotificationsScreen';
import AllMasterScreen from '../screens/OrderListScreen/AllMasterScreen';
import FilterMasters from '../screens/OrderListScreen/Filter';
import OrderFinishedScreen from '../screens/OrderScreen/OrderFinishedScreen';
import Profile from '../screens/Profile/Profile';
import masterOrderListTabNavigator from './MasterOrderListTabNavigator';
import MyOrdersStack from './MyOrdersStackNavigator';

const { width } = Layout.window;

const config = Platform.select({
  web: { headerMode: 'screen' },
  default: {
    headerLayoutPreset: 'center',
    headerMode: 'screen',
  },
});

const AllMasterStack = createStackNavigator(
  {
    AllMaster: AllMasterScreen,
    MasterProfileForClient: MasterProfileForClient,
    FilterMasters: FilterMasters,
    MarketMainProfileClientAll: MarketMain,
  },
  config,
);

const NewsStack = createStackNavigator(
  {
    CreateOrder: CreateOrderScreen,
    CreateOrderSecond: CreateOrderSecond,
    CreateOrderThree: CreateOrderThree,
    CreateOrderFour: CreateOrderFour,
    Finished: OrderFinishedScreen,
  },
  config,
);

const RegisterMasterStack = createStackNavigator(
  {
    RegisterMaster: RegisterMaster,
    SpecList: SpecList,
  },
  config,
);

const ConfigurationStack = createStackNavigator(
  {
    Configuration: ConfigurationScreen,
    AboutApp: AboutApp,
    Confidential: Confidential,
    UserAgreement: UserAgreement,
  },
  config,
);

const ProfileStack = createStackNavigator(
  {
    Profile: Profile,
    SpecListProfile: SpecListProfile,
  },
  config,
);

const LogInClientStack = createStackNavigator(
  {
    LogInClient: LogInClient,
    RegisterClient: RegisterClient,
  },
  config,
);

const NewsListStack = createStackNavigator(
  {
    NewsList: NewsScreen,
    NewsMain: NewsMainScreen,
  },
  config,
);

const HowItWorksStack = createStackNavigator(
  {
    HowItWorksList: HowItWorksListScreen,
    FAQ: FAQ,
    SendQuestion: SendQuestionScreen,
  },
  config,
);

const NotificationsStack = createStackNavigator(
  {
    NotificationsMain: NotificationsScreen,
  },
  config,
);

const MarketMainClientStack = createStackNavigator(
  {
    MarketMain,
  },
  config,
);

const DrawerNavigator = createDrawerNavigator(
  {
    CreateOrder: {
      screen: NewsStack,
      navigationOptions: {
        title: i18n.t('order:create'),
      },
    },
    MyOrders: {
      screen: MyOrdersStack,
      navigationOptions: {
        title: i18n.t('order:myOrders'),
      },
    },
    ListOrders: {
      screen: AllMasterStack,
      navigationOptions: {
        title: i18n.t('order:allMasters'),
      },
      path: '/all-masters',
    },
    MasterListOrders: {
      screen: masterOrderListTabNavigator,
      navigationOptions: {
        title: i18n.t('order:listOrder'),
      },
    },
    MarketMainClient: {
      screen: MarketMainClientStack,
      path: '/market/:marketId',
    },
    Notifications: {
      screen: NotificationsStack,
      navigationOptions: {
        title: i18n.t('order:notification'),
      },
    },
    HowWorks: {
      screen: HowItWorksStack,
      navigationOptions: {
        title: i18n.t('order:howItWorks'),
      },
    },
    News: {
      screen: NewsListStack,
      navigationOptions: {
        title: i18n.t('order:news'),
      },
    },
    Configuration: {
      screen: ConfigurationStack,
      navigationOptions: {
        title: 'Настройки',
      },
    },
    Profile: {
      screen: ProfileStack,
      navigationOptions: {
        title: 'Профиль',
      },
    },
  },
  {
    drawerWidth: width * 0.88,
    drawerPosition: 'left',
    initialRouteName: 'MyOrders',
    contentComponent: (props) => {
      return <DrawerComponent {...props} />;
    },
    contentOptions: {
      activeTintColor: '#c20021',
    },
    onDrawerToogled: (state) => {
      console.log(state);
    },
  },
);

const SwitchNavigator = createSwitchNavigator(
  {
    LogInClient: LogInClientStack,
    RegisterMaster: RegisterMasterStack,
    AppDrawerNavigation: {
      screen: DrawerNavigator,
      path: '',
    },
  },
  { initialRouteName: 'AppDrawerNavigation' },
);

export default SwitchNavigator;
