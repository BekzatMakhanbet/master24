import { AntDesign } from '@expo/vector-icons';
import axios from 'axios';
import hoistStatics from 'hoist-non-react-statics';
import { Spinner } from 'native-base';
import React from 'react';
import { withTranslation } from 'react-i18next';
import { TouchableOpacity, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { connect } from 'react-redux';
import OrderMasterComponent from '../../components/Orders/OrderMasterComponent';
import i18n from '../../i18n';
import { switchMode } from '../../reducers/modeReducer';
import { store } from '../../store';
import { getModeColor } from '../../utils/getModeColor';
import sendPushNotification from '../../utils/sendPushNotification';
import config from '../../config/config';

class OrderMainMasterScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const { state } = navigation;
    return {
      title: i18n.t('order:order'),
      headerLeft: (
        <TouchableOpacity
          onPress={() => {
            navigation.goBack(null);
          }}
          style={{ paddingLeft: 10, width: 80 }}
        >
          <AntDesign size={26} name={'arrowleft'} color="white" />
        </TouchableOpacity>
      ),
      headerStyle: {
        backgroundColor:
          state.params && state.params.color
            ? state.params.color
            : getModeColor(store.getState().modeReducer.mode),
      },
      headerTitleStyle: {
        color: 'white',
      },
    };
  };

  constructor(props) {
    super(props);
    const itemId = this.props.navigation.getParam('itemId', 0);
    this.state = {
      mode: '',
      item: 0,
      itemId,
      spinning: false,
    };
  }

  componentDidMount() {
    const { token } = this.props.authReducer;

    this.getSingleOrder();
    const { mode } = this.props.modeReducer;
    if (mode != this.state.mode) {
      this.props.navigation.setParams({ color: getModeColor(mode) });
      this.setState({ mode });
    }

    const options = {
      method: 'PUT',
      url: `${config.url}/api/v1/order/${this.state.itemId}/view-count`,
    };
    axios(options);
  }

  componentDidUpdate() {
    const { mode } = this.props.modeReducer;
    if (mode != this.state.mode) {
      if (mode === 'client') {
        this.props.navigation.navigate({
          routeName: 'MyOrders',
        });
      }
      this.props.navigation.setParams({ color: getModeColor(mode) });
      this.setState({ mode });
    }
  }

  getSingleOrder = () => {
    axios.get(`${config.url}/api/v1/order?mode=SINGLE&order=${this.state.itemId}`).then((res) => {
      this.setState({ item: res.data.content[0] });
    });
  };

  respondToOrder = (type, text) => {
    //Method for creating Respond to Order from Master
    const { id } = this.props.authReducer;
    if (type === 'MESSAGE') {
      this.setState({ spinning: true });
    }

    const options = {
      method: 'POST',
      headers: {},
      url: `${config.url}/api/v1/history`,
      data: {
        orderId: this.state.item.id,
        respondedMasterId: id,
        historyInfo: {
          communicationType: type,
          text: type === 'MESSAGE' ? text.ru : '',
          textKz: type === 'MESSAGE' ? text.kz : '',
        },
      },
    };
    axios(options)
      .then((res) => {
        sendPushNotification(
          `На заказ №${this.state.item.id} «${this.state.item.description.substring(0, 20)}${
            this.state.item.description.length > 20 ? '...' : ''
          }»`,
          `тапсырыс №${this.state.item.id} «${this.state.item.description.substring(0, 20)}${
            this.state.item.description.length > 20 ? '...' : ''
          }»`,
          'Откликнулся Мастер',
          'Мастер ұсыныс қалдырды',
          this.state.item.customer.id,
          'MyOrder',
          this.state.item.id,
          'client',
          'bells',
        );

        if (type === 'MESSAGE') {
          this.setState({ spinning: false });
          this.props.navigation.goBack(null);
        }
      })
      .catch((err) => {
        console.log(JSON.stringify(err));
      });
  };

  addHistory = (type, historyId) => {
    // When Master calls multiple times pushes to the history of Responds
    const options = {
      method: 'POST',
      headers: {},
      url: `${config.url}/api/v1/history/info/${historyId}`,
      data: {
        communicationType: type,
        text: '',
      },
    };
    axios(options).catch((err) => {
      console.log(JSON.stringify(err));
    });
  };

  render() {
    const spinning = this.state.item === 0 || this.state.spinning;
    return (
      <View style={{ flex: 1 }}>
        <ScrollView>
          {spinning ? (
            <Spinner color="red" />
          ) : (
            <OrderMasterComponent
              item={this.state.item}
              client={true}
              t={this.props.t}
              respondToOrder={this.respondToOrder}
              masterId={this.props.authReducer.id}
              addHistory={this.addHistory}
              promo={this.state.promo}
              navigation={this.props.navigation}
              specializations={this.props.authReducer.specializations}
              cityId={this.props.authReducer.city.id}
            />
          )}
          <View style={{ height: 70 }} />
        </ScrollView>
      </View>
    );
  }
}

export default connect(({ modeReducer, authReducer }) => ({ modeReducer, authReducer }), {
  switchMode,
})(hoistStatics(withTranslation()(OrderMainMasterScreen), OrderMainMasterScreen));
