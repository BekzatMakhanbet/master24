import { FontAwesome, Octicons } from '@expo/vector-icons';
import axios from 'axios';
import hoistStatics from 'hoist-non-react-statics';
import { Spinner } from 'native-base';
import React, { Fragment } from 'react';
import { withTranslation } from 'react-i18next';
import {
  AsyncStorage,
  BackHandler,
  FlatList,
  Linking,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Avatar, Image } from 'react-native-elements';
import { withNavigationFocus } from 'react-navigation';
import { connect } from 'react-redux';
import { setSpecName } from '../../actions/mastersOrderSpecAction';
import { switchMode } from '../../actions/modeActions';
import i18n from '../../i18n';
import { store } from '../../store';
import { getModeColor } from '../../utils/getModeColor';
import getNamesLocal from '../../utils/getNamesLocal';
import getOrderDate from '../../utils/getOrderDate';
import getOrderPrice from '../../utils/getOrderPrice';
import getStatus from '../../utils/getStatus';
import config from '../../config/config';

let doNotTrack = false;

class OrderListScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const { state } = navigation;
    return {
      title: i18n.t('menu:orderList'),
      headerLeft: (
        <TouchableOpacity onPress={navigation.openDrawer} style={{ paddingLeft: 10 }}>
          <Octicons size={26} name={'three-bars'} color="white" />
        </TouchableOpacity>
      ),
      headerLayoutPreset: 'center',
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
    this.state = {
      mode: '',
      spinning: false,
      ordersList: [],
      promos: [],
    };
  }

  componentDidMount() {
    // AsyncStorage.clear()

    this.refresh();
    this.setState({ spinning: true });
    const { mode } = this.props.modeReducer;
    if (mode != this.state.mode) {
      this.props.navigation.setParams({ color: getModeColor(mode) });
      this.setState({ mode });
    }
  }

  refresh = () => {
    axios
      .get(
        `${config.url}/api/v1/order?mode=ALL&status=OPEN&status=IN_PROGRESS&orderBy=CREATED&direction=desc`,
      )
      .then((res) => {
        axios
          .get(
            `http://91.201.215.45:49153/api/v1/promo/order?count=${Math.ceil(
              res.data.content.length / 3,
            )}&displayType=${this.props.modeReducer.mode === 'client' ? 'CUSTOMER' : 'MASTER'}`,
          )
          .then((res2) => {
            this.setState({ promos: res2.data, spinning: false });
          });

        this.setState({ ordersList: res.data.content });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  clearAsync = async () => {
    const asyncStorageKeys = await AsyncStorage.getAllKeys();
    if (asyncStorageKeys.length > 0) {
      AsyncStorage.clear();
    }
  };

  componentDidUpdate(props) {
    const { mode } = this.props.modeReducer;
    if (mode != this.state.mode) {
      this.props.navigation.setParams({ color: getModeColor(mode) });
      this.setState({ mode });
    }
    if (props.isFocused !== this.props.isFocused) {
      if (mode === 'master') {
        this.props.navigation.navigate('MyOrders');
        if (doNotTrack) {
          BackHandler.exitApp();

          doNotTrack = false;
        }

        setTimeout(() => {
          doNotTrack = true;
        }, 500);

        setTimeout(() => {
          doNotTrack = false;
        }, 2000);
      }
    }
  }

  render() {
    const { navigate } = this.props.navigation;
    const { t } = this.props;

    return this.state.spinning ? (
      <Spinner color="red" />
    ) : (
      <View style={{ flex: 1 }}>
        <ScrollView
          refreshControl={
            <RefreshControl
              //refresh control used for the Pull to Refresh
              refreshing={this.state.spinning}
              onRefresh={this.refresh}
            />
          }
        >
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <View
              style={{
                width: '100%',
                justifyContent: 'center',
                paddingTop: 10,
              }}
            >
              {/* <Button onPress={this.clearAsync}>
                <Text allowFontScaling={false}>Очистить</Text>
              </Button> */}
              {this.state.spinning ? (
                <Spinner color="red" />
              ) : this.state.ordersList && this.state.ordersList.length > 0 ? (
                <FlatList
                  data={this.state.ordersList}
                  renderItem={({ item, index }) => {
                    return (
                      <FlatListItem
                        setSpecName={this.props.setSpecName}
                        item={item}
                        navigate={navigate}
                        index={index}
                        navigation={this.props.navigation}
                        promos={this.state.promos}
                      />
                    );
                  }}
                  keyExtractor={(item) => item.id + ''}
                />
              ) : (
                <View
                  style={{
                    width: '90%',
                    height: 240,
                    alignSelf: 'center',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Text
                    allowFontScaling={false}
                    style={{
                      fontSize: 16,
                      fontWeight: '500',
                      marginVertical: 20,
                      color: '#999999',
                    }}
                  >
                    Нет заказов
                  </Text>
                </View>
              )}
            </View>
          </View>
          <View style={{ height: 70 }} />
        </ScrollView>
      </View>
    );
  }
}

class FlatListItem extends React.Component {
  navigate = () => {
    this.props.navigate('OrderMain', { itemId: this.props.item.id });
  };
  render() {
    const { index, promos, navigation } = this.props;
    return (
      <Fragment>
        <TouchableOpacity onPress={this.navigate}>
          <View style={{ flex: 1 }} key={this.props.item.id}>
            <View style={styles.orderContainer}>
              <View style={{ flex: 1, justifyContent: 'center' }}>
                <View style={styles.orderPerson}>
                  <Avatar
                    rounded
                    size="large"
                    icon={{ name: 'user', type: 'font-awesome' }}
                    activeOpacity={0.7}
                    containerStyle={{ flex: 2, justifyContent: 'center' }}
                    source={
                      this.props.item.customer.avatar && {
                        uri: `${config.url}/images/${this.props.item.customer.avatar.imageName}`,
                      }
                    }
                  />
                  <Text
                    allowFontScaling={false}
                    style={{
                      color: '#c20021',
                      fontWeight: '500',
                      textAlign: 'center',
                    }}
                  >
                    {this.props.item.customer.firstName}
                  </Text>
                </View>
              </View>
              <View style={styles.orderText}>
                <Text
                  allowFontScaling={false}
                  style={{
                    color: 'black',
                    fontWeight: '500',
                    fontSize: 15,
                  }}
                >
                  {this.props.item.description && this.props.item.description.length > 45
                    ? `${this.props.item.description.substring(0, 45)}...`
                    : this.props.item.description}
                </Text>
                <View>
                  <View style={{}}>
                    <Text allowFontScaling={false} style={{ fontSize: 12, color: '#c1c3c7' }}>
                      Специализация:
                    </Text>
                    <Text allowFontScaling={false} style={styles.specilization}>
                      {getNamesLocal(
                        this.props.item.specialization.specName,
                        this.props.item.specialization.specNameKz,
                      )}
                    </Text>
                  </View>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginVertical: 5,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <FontAwesome name="clock-o" color={'#c20021'} size={18} />
                    <Text
                      allowFontScaling={false}
                      style={{
                        color: 'black',
                        fontWeight: '500',
                        fontSize: 13,
                      }}
                    >
                      {' '}
                      {getOrderDate(this.props.item.urgency, this.props.item.urgencyDate)}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text
                      allowFontScaling={false}
                      style={{
                        color: '#c20021',
                        fontSize: 18,
                        fontWeight: '500',
                        lineHeight: 23,
                      }}
                    >
                      ₸{' '}
                    </Text>
                    <Text
                      allowFontScaling={false}
                      style={{
                        color: 'black',
                        fontWeight: '500',
                        fontSize: 13,
                      }}
                    >
                      {getOrderPrice(this.props.item.orderPriceType, this.props.item.price)}
                    </Text>
                  </View>
                  <Text allowFontScaling={false} style={{ color: '#c1c3c7', fontSize: 14 }}>
                    Статус
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                  <View>
                    <Text
                      allowFontScaling={false}
                      style={{
                        fontSize: 12,
                        paddingVertical: 2,
                        color: getStatus(this.props.item.status).color,
                        borderWidth: 1,
                        borderColor: getStatus(this.props.item.status).color,
                        borderRadius: 5,
                        padding: 5,
                      }}
                    >
                      {getStatus(this.props.item.status).text}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </TouchableOpacity>
        {(index + 1) % 3 === 0 && promos[(index + 1) / 3 - 1] && (
          <TouchableOpacity
            style={{ width: '95%', alignSelf: 'center' }}
            onPress={() => {
              if (promos[(index + 1) / 3 - 1].link.indexOf('http') !== -1) {
                Linking.openURL(promos[(index + 1) / 3 - 1].link);
              } else {
                navigation.navigate('MarketMain', {
                  marketId: promos[(index + 1) / 3 - 1].link,
                });
              }
            }}
          >
            <Image
              style={{
                borderRadius: 10,
                paddingHorizontal: '5%',
                height: 250,
              }}
              resizeMode="contain"
              source={{
                uri: promos[(index + 1) / 3 - 1]
                  ? `http://91.201.215.45:49153/images/${
                      promos[(index + 1) / 3 - 1].image.imageName
                    }`
                  : config.defaultImage,
              }}
            />
          </TouchableOpacity>
        )}
      </Fragment>
    );
  }
}

export default withNavigationFocus(
  connect(({ authReducer, modeReducer }) => ({ authReducer, modeReducer }), {
    switchMode,
    setSpecName,
  })(hoistStatics(withTranslation()(OrderListScreen), OrderListScreen)),
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  orderContainer: {
    width: '95%',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexDirection: 'row',
    marginVertical: 5,
    paddingHorizontal: 15,
    paddingBottom: 15,
    marginLeft: '2.5%',
    paddingTop: 15,
    borderRadius: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,

    elevation: 3,
  },
  orderPerson: {
    width: '110%',
    alignItems: 'center',
  },
  specilization: {
    fontWeight: '500',
    fontSize: 13,
  },
  orderText: {
    width: '70%',
    paddingLeft: 12,
  },
});
