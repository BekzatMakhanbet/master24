import { AntDesign } from '@expo/vector-icons';
import axios from 'axios';
import hoistStatics from 'hoist-non-react-statics';
import { Spinner } from 'native-base';
import React from 'react';
import { withTranslation } from 'react-i18next';
import { TouchableOpacity, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { connect } from 'react-redux';
import OrderComponent from '../../components/Orders/OrderComponent';
import { switchMode } from '../../reducers/modeReducer';
import { store } from '../../store';
import { getModeColor } from '../../utils/getModeColor';
import config from '../../config/config';

class OrderMainScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const { state } = navigation;
    return {
      title: 'Заказ',
      // headerRight:(
      //   <TouchableOpacity style={{paddingRight:10}}>
      //     <MaterialCommunityIcons size={26} name={'filter-outline'}  color='white'/>
      //   </TouchableOpacity>
      // ),
      headerLeft: (
        <TouchableOpacity
          onPress={() => {
            navigation.goBack(null);
          }}
          style={{ paddingLeft: 10 }}
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

    const itemId = props.navigation.getParam('itemId', 0);
    this.state = {
      mode: '',
      itemId,
      item: 0,
      spinning: true,
    };
  }

  componentDidMount() {
    const { mode } = this.props.modeReducer;
    if (mode != this.state.mode) {
      this.props.navigation.setParams({ color: getModeColor(mode) });
      this.setState({ mode });
    }

    this.getSingleOrder();

    const options = {
      method: 'PUT',
      headers: {},
      url: `${config.url}/api/v1/order/${this.state.itemId}/order-view-count`,
    };
    axios(options);
  }

  getSingleOrder = () => {
    console.log('started axiso', this.state.itemId);

    axios
      .get(`${config.url}/api/v1/order?mode=SINGLE&order=${this.state.itemId}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then((res) => {
        this.setState({ item: res.data.content[0], spinning: false });
        console.log(res.data);

        console.log('finished axios');
      })
      .catch((err) => {
        console.log(err);
      });
  };

  componentDidUpdate(props) {
    const { mode } = this.props.modeReducer;
    if (mode != this.state.mode) {
      this.props.navigation.setParams({ color: getModeColor(mode) });
      this.setState({ mode });
    }
  }

  render() {
    return this.state.item === 0 ? (
      <Spinner color="red" />
    ) : (
      <View style={{ flex: 1 }}>
        <ScrollView>
          {this.state.item !== 0 && (
            <OrderComponent
              item={this.state.item}
              client={true}
              notShowReopen={true}
              t={this.props.t}
              navigation={this.props.navigation}
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
})(hoistStatics(withTranslation()(OrderMainScreen), OrderMainScreen));
