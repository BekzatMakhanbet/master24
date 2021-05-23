import { createStackNavigator } from 'react-navigation';
import MarketMain from '../screens/Market/MarketMain';
import MasterProfileForClient from '../screens/Master/MasterProfileForClient';
import MyOrderMaster from '../screens/MyOrder/MyOrderMaster';
import MyOrdersScreen from '../screens/MyOrders/MyOrdersScreen';
import EditOrder from '../screens/OrderScreen/EditOrder';
import MyOrderFinished from '../screens/OrderScreen/MyOrderFinished';
import ReopenOrder from '../screens/OrderScreen/ReopenOrder';
import ReopenSpecList from '../screens/OrderScreen/ReopenSpecList';
import OneSpecList from '../screens/OrderScreen/SpecList';
import tabNavigator from './MyOrderTabNavigator';

const MyOrdersStack = createStackNavigator(
  {
    MyOrders: MyOrdersScreen,
    MyOrderMaster: MyOrderMaster,
    MyOrder: {
      screen: tabNavigator,
      navigationOptions: {
        header: null,
      },
    },
    MyOrderFinished: MyOrderFinished,
    ReopenOrder: ReopenOrder,
    EditOrder: EditOrder,
    OneSpecList: OneSpecList,
    ReopenSpecList: ReopenSpecList,
    MasterProfileIntoOrder: MasterProfileForClient,
    MarketIntoOrder: MarketMain,
  },
  {
    headerLayoutPreset: 'center',
  },
);

export default MyOrdersStack;
