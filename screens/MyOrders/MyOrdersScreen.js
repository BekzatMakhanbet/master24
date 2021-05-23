import { FontAwesome, Octicons } from '@expo/vector-icons';
import axios from 'axios';
import { Button, Container, Spinner, Tab, TabHeading, Tabs, Toast } from 'native-base';
import React, { Fragment } from 'react';
import {
  BackHandler,
  FlatList,
  Image,
  Linking,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Avatar } from 'react-native-elements';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { NavigationEvents, withNavigationFocus } from 'react-navigation';
import { connect } from 'react-redux';
import { setSpecName } from '../../actions/mastersOrderSpecAction';
import { switchMode } from '../../actions/modeActions';
import { setActiveTab } from '../../actions/setActiveTab';
import Guides from '../../components/Guides/Guides';
import wrapToHoc from '../../hoc/wrapToHoc';
import i18n from '../../i18n';
import { store } from '../../store';
import getFontSize from '../../utils/getFontSize';
import { getModeColor } from '../../utils/getModeColor';
import getNamesLocal from '../../utils/getNamesLocal';
import getOrderDate from '../../utils/getOrderDate';
import getOrderPrice from '../../utils/getOrderPrice';
import getStatus from '../../utils/getStatus';
import config from '../../config/config';

let first = true;
let i = 0;

const TabText = (text, count, activeTab, myPos, mode) => (
  <TabHeading style={{ backgroundColor: '#e9f0f4' }}>
    <Text
      allowFontScaling={false}
      style={{
        color: activeTab !== myPos ? '#999999' : 'black',
        fontWeight: '500',
      }}
    >
      {text}{' '}
      <Text allowFontScaling={false} style={{ color: '#c20021', fontWeight: '500' }}>
        ({count})
      </Text>
    </Text>
  </TabHeading>
);

class MyOrdersScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const { state } = navigation;
    return {
      title: i18n.t('menu:myOrders'),
      headerLeft: (
        <TouchableOpacity onPress={navigation.openDrawer} style={{ paddingLeft: 10, width: 80 }}>
          <Octicons size={26} name={'three-bars'} color="white" />
        </TouchableOpacity>
      ),
      headerRight: store.getState().modeReducer.mode === 'client' && (
        <Guides screenName="MyOrders" />
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
      finished: [],
      notFinished: [],
      promos: [],
      refreshing: false,
      spinningFirst: false,
      spinningSecond: false,
      spinningFirstMore: false,
      spinningSecondMore: false,
      closeApp: false,
      page1: 0,
      page2: 0,
    };
  }

  componentDidMount() {
    const { mode } = this.props.modeReducer;
    if (mode != this.state.mode) {
      this.props.navigation.setParams({ color: getModeColor(mode) });
      this.setState({ mode });
    }
    this.refresh();

    if (!this.props.authReducer.loggedIn) {
      this.props.navigation.navigate('LogInClient');
    }
  }

  handleBack = () => {
    Toast.show({
      text: 'Вы хотите выйти ?',
      buttonText: 'Да',
      onClose: (status) => console.log(status),
    });
    return true;
  };

  refreshClient = () => {
    this.setState({ spinningFirst: true, spinningSecond: true });

    this.refreshClient1();
    this.refreshClient2();
  };

  refreshClient1 = () => {
    //Refresh Method for Tab 1 My Order Customer (First Tab: Moderation, Open, In Progress, Waiting For Customer Responce statuses)
    const { id } = this.props.authReducer;
    axios
      .get(
        `${config.url}/api/v1/order?mode=CUSTOMER&customer=${id}&status=MODERATION&status=OPEN&status=IN_PROGRESS&status=WAITING_FOR_CUSTOMER_RESPONSE&page=${this.state.page1}`,
      )
      .then((res) => {
        if (this.state.page1 === 0) {
          this.setState({
            notFinished: res.data,
            spinningFirst: false,
          });
        } else {
          const update = this.state.notFinished.content.concat(res.data.content);
          res.data.content = update;
          this.setState({
            notFinished: res.data,
            spinningFirst: false,
            spinningFirstMore: false,
          });
        }
      })
      .catch((err) => console.log(err));
  };

  refreshClient2 = () => {
    //Refresh Method for Tab 2 My Orders Customer (Cancelled, Completed statuses)
    const { id } = this.props.authReducer;
    axios
      .get(
        `${config.url}/api/v1/order?mode=CUSTOMER&customer=${id}&status=CANCELLED&status=COMPLETED&page=${this.state.page2}&orderBy=END_DATE`,
      )
      .then((res) => {
        if (this.state.page2 === 0) {
          this.setState({
            finished: res.data,
            spinningSecond: false,
          });
        } else {
          const update = this.state.finished.content.concat(res.data.content);
          res.data.content = update;
          this.setState({
            finished: res.data,
            spinningSecond: false,
            spinningSecondMore: false,
          });
        }
      })
      .catch((err) => console.log(err));
  };

  refreshMaster = () => {
    this.setState({ spinningFirst: true, spinningSecond: true });

    this.refreshMaster1();
    this.refreshMaster2();
  };

  refreshMaster1 = () => {
    const { id } = this.props.authReducer;
    //Refresh Method for Tab 1 My Order Master (First Tab: IN_PROGRESS, Waiting For Customer Responce statuses)

    axios
      .get(
        `${config.url}/api/v1/order?mode=MASTER&master=${id}&status=IN_PROGRESS&status=WAITING_FOR_CUSTOMER_RESPONSE&page=${this.state.page1}`,
      )
      .then((res) => {
        if (this.state.page1 === 0) {
          this.setState({
            notFinished: res.data,
            spinningFirst: false,
            spinningFirstMore: false,
          });
        } else {
          const update = this.state.notFinished.content.concat(res.data.content);
          res.data.content = update;
          this.setState({
            notFinished: res.data,
            spinningFirst: false,
            spinningFirstMore: false,
          });
        }
      });
  };

  refreshMaster2 = () => {
    const { id } = this.props.authReducer;
    //Refresh Method for Tab 2 My Orders Customer (Cancelled, Completed statuses)

    axios
      .get(
        `${config.url}/api/v1/order?mode=MASTER&master=${id}&status=CANCELLED&status=COMPLETED&orderBy=END_DATE&page=${this.state.page2}`,
      )
      .then((res) => {
        if (this.state.page2 === 0) {
          this.setState({
            finished: res.data,
            spinningSecond: false,
            spinningSecondMore: false,
          });
        } else {
          const update = this.state.finished.content.concat(res.data.content);
          res.data.content = update;
          this.setState({
            finished: res.data,
            spinningSecond: false,
            spinningSecondMore: false,
          });
        }
      })
      .catch((err) => console.log(err));
  };

  refresh = () => {
    const { mode } = this.props.modeReducer;
    this.setState({ page1: 0, page2: 0 }, () => {
      if (mode === 'master') {
        this.refreshMaster();
      } else {
        this.refreshClient();
      }
    });
  };

  componentDidUpdate(props) {
    const { mode } = this.props.modeReducer;
    if (mode != this.state.mode) {
      this.props.navigation.setParams({ color: getModeColor(mode) });
      this.setState({ mode, page1: 0, page2: 0 }, () => {
        this.refresh();
      });
    }
    if (props.isFocused !== this.props.isFocused) {
      // this.refresh();
      if (!props.authReducer.loggedIn) {
        if (!first) {
          BackHandler.exitApp();
          this.props.navigation.navigate('ListOrders');
        } else {
          first = false;
        }
      }
    }
  }

  navigateToCreate = () => {
    this.props.navigation.dispatch({
      type: 'Navigation/NAVIGATE',
      routeName: 'CreateOrder',
      action: {
        type: 'Navigation/NAVIGATE',
        routeName: 'NewsStack',
      },
    });
  };

  render() {
    const { t } = this.props;
    const { activeTab } = this.props.activeTab;
    const { navigate } = this.props.navigation;
    const { mode } = this.props.modeReducer;
    const color = getModeColor(mode);

    return (
      this.props.authReducer.loggedIn && (
        <Container>
          <NavigationEvents onWillFocus={(payload) => this.refresh()} />
          <Tabs
            initialPage={activeTab}
            page={activeTab}
            onChangeTab={({ i }) => this.props.setActiveTab(i)}
            tabBarUnderlineStyle={{
              backgroundColor: color,
              height: 4,
            }}
          >
            <Tab
              heading={TabText(
                t('order:current'),
                this.state.notFinished.totalElements ? this.state.notFinished.totalElements : 0,
                activeTab,
                0,
              )}
            >
              <ScrollView
                refreshControl={
                  <RefreshControl
                    //refresh control used for the Pull to Refresh
                    refreshing={this.state.refreshing}
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
                    {this.state.spinningFirst ? (
                      <Spinner color="red" />
                    ) : !this.state.notFinished.empty ? (
                      <Fragment>
                        <FlatList
                          data={this.state.notFinished.content}
                          renderItem={({ item, index }) => {
                            return (
                              <FlatListItem
                                setSpecName={this.props.setSpecName}
                                item={item}
                                navigate={navigate}
                                index={index}
                                finished={false}
                                mode={mode}
                                promos={this.state.promos}
                                navigation={this.props.navigation}
                              />
                            );
                          }}
                          keyExtractor={(item) => item.id + ''}
                        />
                        {!this.state.notFinished.last &&
                          (this.state.spinningFirstMore ? (
                            <Spinner color="red" />
                          ) : (
                            <TouchableOpacity
                              onPress={() => {
                                this.setState(
                                  {
                                    page1: this.state.page1 + 1,
                                    spinningFirstMore: true,
                                  },
                                  () => {
                                    console.log(this.state.page1);
                                    if (this.state.mode === 'client') {
                                      this.refreshClient1();
                                    } else {
                                      this.refreshMaster1();
                                    }
                                  },
                                );
                              }}
                              style={{
                                alignSelf: 'center',
                                marginVertical: 10,
                              }}
                            >
                              <Text
                                allowFontScaling={false}
                                style={{
                                  color: '#c20021',
                                  fontSize: 17,
                                  fontWeight: '500',
                                  textAlign: 'center',
                                }}
                              >
                                + {t('simple:showMore')}
                              </Text>
                            </TouchableOpacity>
                          ))}
                      </Fragment>
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
                          {t('order:noOrders')}
                        </Text>
                        {mode === 'master' || (
                          <Button
                            onPress={this.navigateToCreate}
                            style={{
                              marginTop: 50,
                              backgroundColor: '#c20021',
                              width: '90%',
                              justifyContent: 'center',
                              alignItems: 'center',
                            }}
                          >
                            <Text
                              allowFontScaling={false}
                              style={{
                                alignSelf: 'center',
                                color: '#fff',
                                fontSize: 16,
                                fontWeight: '500',
                                textAlign: 'center',
                              }}
                            >
                              {t('menu:createOrder')}
                            </Text>
                          </Button>
                        )}
                      </View>
                    )}
                  </View>
                </View>
              </ScrollView>
            </Tab>
            <Tab
              heading={TabText(
                t('order:finished'),
                this.state.finished.totalElements ? this.state.finished.totalElements : 0,
                activeTab,
                1,
              )}
            >
              <ScrollView
                refreshControl={
                  <RefreshControl
                    //refresh control used for the Pull to Refresh
                    refreshing={this.state.refreshing}
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
                    {this.state.spinningSecond ? (
                      <Spinner color="red" />
                    ) : !this.state.finished.empty ? (
                      <Fragment>
                        <FlatList
                          data={this.state.finished.content}
                          renderItem={({ item, index }) => {
                            return (
                              <FlatListItem
                                setSpecName={this.props.setSpecName}
                                item={item}
                                navigate={navigate}
                                index={index}
                                finished={true}
                                mode={mode}
                                promos={this.state.promos}
                                navigation={this.props.navigation}
                              />
                            );
                          }}
                          keyExtractor={(item) => item.id + ''}
                        />
                        {!this.state.finished.last &&
                          (this.state.spinningSecondMore ? (
                            <Spinner color="red" />
                          ) : (
                            <TouchableOpacity
                              onPress={() => {
                                this.setState(
                                  {
                                    page2: this.state.page2 + 1,
                                    spinningSecondMore: true,
                                  },
                                  () => {
                                    console.log(this.state.page2);
                                    if (this.state.mode === 'client') {
                                      this.refreshClient2();
                                    } else {
                                      this.refreshMaster2();
                                    }
                                  },
                                );
                              }}
                              style={{
                                alignSelf: 'center',
                                marginVertical: 10,
                              }}
                            >
                              <Text
                                allowFontScaling={false}
                                style={{
                                  color: '#c20021',
                                  fontSize: 17,
                                  fontWeight: '500',
                                  textAlign: 'center',
                                }}
                              >
                                + {t('simple:showMore')}
                              </Text>
                            </TouchableOpacity>
                          ))}
                      </Fragment>
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
                          {t('order:noFinishedOrders')}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </ScrollView>
            </Tab>
          </Tabs>
        </Container>
      )
    );
  }
}

class FlatListItem extends React.Component {
  navigate = () => {
    if (this.props.mode === 'master') {
      this.props.navigate('MyOrderMaster', {
        itemId: this.props.item.id,
        refresh: this.props.refresh,
      });
    } else {
      if (
        this.props.item.status === 'CANCELLED' ||
        this.props.item.status === 'COMPLETED' ||
        this.props.item.status === 'MODERATION' ||
        this.props.item.status === 'WAITING_FOR_CUSTOMER_RESPONSE'
      ) {
        this.props.navigation.navigate({
          routeName: 'MyOrderFinished',
          params: {
            itemId: this.props.item.id,
            refresh: this.props.refresh,
          },
          key: 'MyOrderFinished' + Math.random() * 1000,
        });
      } else {
        this.props.navigate('MyOrder', {
          itemId: this.props.item.id,
          refresh: this.props.refresh,
        });
      }
    }
  };
  render() {
    const { finished, index, promos, navigation, t } = this.props;
    return (
      <Fragment>
        <TouchableWithoutFeedback onPress={this.navigate}>
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
                      color: finished ? '#999999' : '#c20021',
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
                    color: finished ? '#999999' : 'black',
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
                    <Text
                      allowFontScaling={false}
                      style={[styles.specilization, { color: finished ? '#999999' : 'black' }]}
                    >
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
                    alignItems: 'center',
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <FontAwesome
                      name="clock-o"
                      color={finished ? '#999999' : '#c20021'}
                      size={getFontSize(18)}
                    />
                    <Text
                      allowFontScaling={false}
                      style={{
                        color: finished ? '#999999' : 'black',
                        fontWeight: '500',
                        fontSize: getFontSize(14),
                      }}
                    >
                      {' '}
                      {getOrderDate(this.props.item.urgency, this.props.item.urgencyDate)}
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      padding: 0,
                      margin: 0,
                    }}
                  >
                    <Text
                      allowFontScaling={false}
                      style={{
                        color: finished ? '#999999' : '#c20021',
                        fontSize: getFontSize(18),
                        lineHeight: getFontSize(23),
                        fontWeight: '500',
                      }}
                    >
                      ₸{' '}
                    </Text>
                    <Text
                      allowFontScaling={false}
                      style={{
                        color: finished ? '#999999' : 'black',
                        fontWeight: '500',
                        fontSize: getFontSize(14),
                      }}
                    >
                      {getOrderPrice(this.props.item.orderPriceType, this.props.item.price)}
                    </Text>
                  </View>
                  <Text
                    allowFontScaling={false}
                    style={{ color: '#c1c3c7', fontSize: getFontSize(15) }}
                  >
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
        </TouchableWithoutFeedback>
        {(index + 1) % 2 === 0 && promos[(index + 1) / 2 - 1] && (
          <TouchableWithoutFeedback
            style={{ width: '95%', alignSelf: 'center' }}
            onPress={() => {
              if (promos[(index + 1) / 2 - 1].link.indexOf('http') !== -1) {
                Linking.openURL(promos[(index + 1) / 2 - 1].link);
              } else {
                navigation.navigate('MarketMain', {
                  marketId: promos[(index + 1) / 2 - 1].link,
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
                uri: promos[(index + 1) / 2 - 1]
                  ? `http://91.201.215.45:49153/images/${
                      promos[(index + 1) / 2 - 1].image.imageName
                    }`
                  : config.defaultImage,
              }}
            />
          </TouchableWithoutFeedback>
        )}
      </Fragment>
    );
  }
}

export default withNavigationFocus(
  connect(
    ({ authReducer, modeReducer, activeTab }) => ({
      authReducer,
      modeReducer,
      activeTab,
    }),
    {
      switchMode,
      setSpecName,
      setActiveTab,
    },
  )(wrapToHoc(MyOrdersScreen)),
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
    // justifyContent:'center',
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
  titleTextModal2: {
    fontSize: 20,
    marginBottom: 10,
    fontWeight: '500',
    width: '100%',
    borderBottomColor: '#e9f0f4',
    borderBottomWidth: 2,
    textAlign: 'center',
  },
  buttonModal: {
    backgroundColor: '#c20021',
    width: '100%',
    alignItems: 'center',
    textAlign: 'center',
    marginVertical: 5,
  },
});
