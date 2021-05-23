import { AntDesign } from '@expo/vector-icons';
import axios from 'axios';
import hoistStatics from 'hoist-non-react-statics';
import {
  Badge,
  Body,
  Button,
  Container,
  Left,
  Right,
  Spinner,
  Tab,
  TabHeading,
  Tabs,
} from 'native-base';
import React from 'react';
import { withTranslation } from 'react-i18next';
import {
  Dimensions,
  FlatList,
  Image,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Avatar } from 'react-native-elements';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { NavigationActions, StackActions, withNavigationFocus } from 'react-navigation';
import { connect } from 'react-redux';
import { setSpecName } from '../../actions/mastersOrderSpecAction';
import { ErrorModal } from '../../components/ModalComponents/ErrorModal';
import { OrderFinishModal } from '../../components/ModalComponents/OrderFinishModal';
import { OrderFinishedModalComponent } from '../../components/ModalComponents/OrderFinsihedModalComponent';
import { SuccessMasterChoosed } from '../../components/ModalComponents/SuccessMasterChoosed';
import OrderComponent from '../../components/Orders/OrderComponent';
import Promo from '../../components/Promo';
import config from '../../config/config';
import i18n from '../../i18n';
import { switchMode } from '../../reducers/modeReducer';
import getDateByMonth from '../../utils/getDateByMonth';
import getLastOnline from '../../utils/getLastOnline';
import getNamesLocal from '../../utils/getNamesLocal';
import getUserDuration from '../../utils/getUserDuration';
import getUserRating from '../../utils/getUserRating';
import sendPushNotification from '../../utils/sendPushNotification';

const { height: fullHeight } = Dimensions.get('window');

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
      {myPos === 0 || (
        <Text allowFontScaling={false} style={{ color: '#c20021', fontWeight: '500' }}>
          ({count})
        </Text>
      )}
    </Text>
  </TabHeading>
);

class HomeScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const { state } = navigation;

    return {
      // title: "Заказ",
      tabBarVisible: state.params && state.params.visible ? state.params.visible : false,
      tabBarLabel: ({ focused }) => (
        <Text allowFontScaling={false} style={focused ? styles.focused : styles.notFocused}>
          {i18n.t('order:myOrder')}
        </Text>
      ),
      tabBarIcon: ({ focused }) => (
        <Image
          source={require('../../assets/images/Заказы.png')}
          style={{
            width: 26,
            height: 26,
            tintColor: focused ? '#c20021' : '#999999',
          }}
        />
      ),
    };
  };
  constructor(props) {
    super(props);
    const item = props.navigation.dangerouslyGetParent().getParam('item', 0);
    const itemId = props.navigation.dangerouslyGetParent().getParam('itemId', 0);
    const clientModal = props.navigation.dangerouslyGetParent().getParam('clientModal', false);
    const masterId = props.navigation.dangerouslyGetParent().getParam('masterId', 0);
    const openResponds = props.navigation.dangerouslyGetParent().getParam('openResponds', false);

    this.state = {
      mode: '',
      item,
      activeTab: openResponds ? 1 : 0,
      visibleModal: false,
      itemId,
      errorModal: false,
      finishModal: false,
      successMasterChoosed: false,
      clientModal,
      masterId,
      spinning: false,
      offset: 0,
      promos: [],
      spinningRespond: false,
      watched: [],
      watchedEnd: false,
    };
  }

  componentDidMount() {
    if (this.state.item === 0 && this.state.itemId !== 0) {
      this.getSingleOrder();
    } else {
      const { status } = this.state.item;
      const tabBarStatus =
        status === 'CANCELLED' ||
        status === 'COMPLETED' ||
        status === 'WAITING_FOR_CUSTOMER_RESPONSE'
          ? 'notShow'
          : 'show';
      this.props.setSpecName(tabBarStatus, '', '', this.state.item.specialization.id);
    }
  }

  componentDidUpdate(props) {
    if (
      this.state.activeTab === 0 &&
      this.props.navigation.getParam('visible') === false &&
      this.state.item !== 0
    ) {
      this.props.navigation.setParams({ visible: true });
    } else if (this.state.activeTab === 1 && this.props.navigation.getParam('visible') === true) {
      this.props.navigation.setParams({ visible: false });
    }

    if (this.state.item === 0 && this.state.itemId !== 0) {
      this.getSingleOrder();
    }

    if (props.isFocused !== this.props.isFocused) {
      if (this.props.modeReducer.mode === 'master') {
        this.props.navigation.navigate('MyOrders');
      }
    }
  }

  onLayout = ({
    nativeEvent: {
      layout: { height },
    },
  }) => {
    const offset = fullHeight - height;
    this.setState({ offset });
  };

  setVisibleModal = (value) => {
    this.setState({ visibleModal: value });
  };

  getSingleOrder = () => {
    axios.get(`${config.url}/api/v1/order?mode=SINGLE&order=${this.state.itemId}`).then((res) => {
      const { status } = res.data.content[0];

      if (
        status &&
        (status === 'CANCELLED' ||
          status === 'COMPLETED' ||
          status === 'WAITING_FOR_CUSTOMER_RESPONSE')
      ) {
        const resetAction = StackActions.reset({
          index: 0,
          actions: [
            NavigationActions.navigate({
              routeName: 'MyOrderFinished',
              params: { itemId: res.data.content[0].id },
            }),
          ],
        });
        this.props.navigation.dispatch(resetAction);
      }
      this.setState({ item: res.data.content[0] }, () => {
        if (this.state.activeTab === 1) {
        } else {
          this.props.navigation.setParams({ visible: true });
        }

        const { status } = this.state.item;
        const tabBarStatus =
          status === 'CANCELLED' ||
          status === 'COMPLETED' ||
          status === 'WAITING_FOR_CUSTOMER_RESPONSE'
            ? 'notShow'
            : 'show';

        this.props.setSpecName(tabBarStatus, '', '', this.state.item.specialization.id);
      });
    });
  };

  cancelOrder = (id, cancellationReason) => {
    this.setState({ spinning: true });

    axios({
      method: 'PATCH',
      url: `${config.url}/api/v1/order/${id}`,
      data: { status: 'CANCELLED', cancellationReason },
    })
      .then((res) => {
        this.setState({ spinning: false });

        this.props.navigation.goBack(null);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  sendReview = (rating, text) => {
    const obj = {
      rating,
      text,
      masterId: this.state.item.master.id,
      userId: this.props.authReducer.id,
    };
    this.setState({ spinning: true, visibleModal: false });

    axios({
      method: 'POST',
      url: `${config.url}/api/v1/review`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: obj,
    })
      .then((res) => {
        this.sendNotification(res.data.id);
        this.setState({ spinning: false });
        this.props.navigation.goBack(null);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  sendNotification = (reviewId) => {
    sendPushNotification(
      `Заказчик подтвердил что заказ №${
        this.state.item.id
      } «${this.state.item.description.substring(0, 20)}${
        this.state.item.description.length > 20 ? '...' : ''
      }» завершен`,
      `Тапсырыс беруші №${this.state.item.id} «${this.state.item.description.substring(0, 20)}${
        this.state.item.description.length > 20 ? '...' : ''
      }» тапсырысы аяқталғанын растады`,
      'Заказ завершен',
      'Тапсырыс аяқталды',
      this.state.item.master.id,
      'MyOrders',
      reviewId,
      'master',
      'bells',
    );
  };

  finishOrder = () => {
    this.setState({ spinning: true });
    axios({
      method: 'PATCH',
      url: `${config.url}/api/v1/order/${this.state.item.id}`,
      data: { status: 'COMPLETED' },
    })
      .then((res) => {
        this.setState({
          visibleModal: true,
          finishModal: false,
          spinning: false,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  navigateToEdit = () => {
    this.props.navigation.navigate('EditOrder', {
      item: this.state.item,
    });
  };

  chooseMaster = (masterId) => {
    const { token } = this.props.authReducer;
    this.setState({ spinning: true });

    const options = {
      method: 'PUT',
      headers: {},
      url: `${config.url}/api/v1/order/customer/${this.state.item.id}/select/${masterId}`,
    };
    axios(options)
      .then((res) => {
        axios({
          method: 'PATCH',
          url: `${config.url}/api/v1/order/${this.state.item.id}`,
          data: { status: 'IN_PROGRESS' },
        })
          .then(() => {
            sendPushNotification(
              `на заказ №${this.state.item.id} «${this.state.item.description.substring(0, 20)}${
                this.state.item.description.length > 20 ? '...' : ''
              }»`,
              `тапсырыс №${this.state.item.id} «${this.state.item.description.substring(0, 20)}${
                this.state.item.description.length > 20 ? '...' : ''
              }»`,
              'Вас выбрали Мастером',
              'Сізді Мастер етіп таңдады',
              masterId,
              'MyOrderMaster',
              this.state.item.id,
              'master',
              'check',
            );
            this.setState({ successMasterChoosed: true, spinning: false });
          })
          .catch((err) => {
            console.log(err);
          });
      })
      .catch(() => {
        this.setState({ errorModal: true });
      });
  };

  reopenOrder = () => {
    this.props.navigation.navigate('ReopenOrder', {
      item: this.state.item,
    });
  };

  onChangeTab = ({ i }) => {
    this.setState({ activeTab: i }, () => {
      if (this.state.activeTab === 1) {
        this.props.navigation.setParams({ visible: false });
        this.setState({ watched: [], watchedEnd: false });
      } else {
        this.props.navigation.setParams({ visible: true });
      }
    });
  };

  onViewableItemsChanged = ({ viewableItems }) => {
    const { watched } = this.state;
    viewableItems.filter((item) => this.state.watched.includes(item.index));
    viewableItems.forEach((item) => {
      if (!watched.includes(item.index)) {
        if ((item.index + 1) % 2 === 0) {
          this.fetchPromos(item.index + 1);
        }
        watched.push(item.index);
      }
    });
  };

  onEndReached = () => {
    if (!this.state.watchedEnd) {
      this.fetchPromos(Math.ceil(this.state.item.communicationHistories.length / 2) * 2);
      this.setState({ watchedEnd: true });
    }
  };

  fetchPromos = (index) => {
    const promoIndex = index / 2 - 1;
    const { promos } = this.state;
    if (!promos[promoIndex]) {
      promos[promoIndex] = { fetching: true };
      this.setState({ promos });
      axios
        .get(
          `${config.url}/api/v1/promo/order?count=1&displayType=CUSTOMER&city=${this.props.authReducer.city.id}`,
        )
        .then(({ data }) => {
          promos[promoIndex] = data[0];
          this.setState({ promos });
        });
    }
  };

  render() {
    const { t } = this.props;
    let { activeTab } = this.state;
    const { navigate } = this.props.navigation;
    const finished =
      this.state.item.status === 'CANCELLED' || this.state.item.status === 'COMPLETED';

    const spin = this.state.item === 0 || this.state.spinning;

    return (
      <Container>
        <View
          style={{
            height: 80,
            paddingTop: 25,
            flexDirection: 'row',
            backgroundColor: '#c20021',
          }}
        >
          <Left>
            <TouchableOpacity
              onPress={() => {
                this.props.navigation.goBack(null);
              }}
              style={{ paddingLeft: 10, width: 80 }}
            >
              <AntDesign size={26} name={'arrowleft'} color="white" />
            </TouchableOpacity>
          </Left>
          <Body>
            <Text style={{ fontSize: 20, fontWeight: '500', color: 'white' }}>
              {t('order:order')}
            </Text>
          </Body>
          <Right>
            <Button transparent />
          </Right>
        </View>

        {!spin ? (
          <Tabs
            initialPage={this.state.activeTab}
            page={this.state.activeTab}
            onChangeTab={this.onChangeTab}
            tabBarUnderlineStyle={{ backgroundColor: '#c20021', height: 4 }}
          >
            <Tab heading={TabText(t('order:order'), 12, activeTab, 0)}>
              {!spin ? (
                <OrderComponent
                  item={this.state.item}
                  t={this.props.t}
                  cancelOrder={this.cancelOrder}
                  client={finished}
                  navigateToEdit={this.navigateToEdit}
                  finishOrder={() => this.setState({ finishModal: true })}
                  reopenOrder={this.reopenOrder}
                  navigation={this.props.navigation}
                  cityId={this.props.authReducer.city.id}
                />
              ) : (
                <Spinner color="red" />
              )}
            </Tab>
            <Tab
              heading={TabText(
                t('order:responds'),
                this.state.item.communicationHistories
                  ? this.state.item.communicationHistories.length
                  : 0,
                activeTab,
                1,
              )}
            >
              <ScrollView
                style={{ width: '100%' }}
                contentContainerStyle={{
                  justifyContent: 'center',
                  flexGrow: 1,
                  paddingBottom: 20,
                }}
              >
                {this.state.spinningRespond ? (
                  <Spinner color="red" />
                ) : this.state.item.communicationHistories ? (
                  <FlatList
                    data={this.state.item.communicationHistories}
                    onEndReached={this.onEndReached}
                    onEndReachedThreshold={0}
                    onViewableItemsChanged={this.onViewableItemsChanged}
                    viewabilityConfig={{ viewAreaCoveragePercentThreshold: 10 }}
                    renderItem={({ item, index }) => {
                      return (
                        <FlatListItem
                          last={index + 1 === this.state.item.communicationHistories.length}
                          chooseMaster={this.chooseMaster}
                          item={item}
                          orderId={this.state.item.id}
                          promos={this.state.promos}
                          cantCall={
                            this.state.item.status === 'CANCELLED' ||
                            this.state.item.status === 'COMPLETED'
                          }
                          navigate={navigate}
                          single={
                            this.state.item.communicationHistories &&
                            this.state.item.communicationHistories.length === 1
                          }
                          index={index}
                          t={this.props.t}
                          canPickMaster={!this.state.item.master}
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
                        textAlign: 'center',
                        fontSize: 16,
                        fontWeight: '500',
                        marginVertical: 20,
                        color: '#999999',
                      }}
                    >
                      {t('order:noResponds')}
                    </Text>
                  </View>
                )}
              </ScrollView>
            </Tab>
          </Tabs>
        ) : (
          <Spinner color="red" />
        )}
        <OrderFinishedModalComponent
          visibleModal={this.state.visibleModal}
          setVisibleModal={this.setVisibleModal}
          sendReview={this.sendReview}
          sendNotification={this.sendNotification}
          user={this.state.item.master}
          order={this.state.item}
        />
        <ErrorModal
          visibleModal={this.state.errorModal}
          closeErrorModal={() => this.setState({ errorModal: false })}
        />
        <OrderFinishModal
          visibleModal={this.state.finishModal}
          closeFinishModal={() => this.setState({ finishModal: false })}
          finishOrder={this.finishOrder}
        />
        <SuccessMasterChoosed
          visibleModal={this.state.successMasterChoosed}
          closeSuccessMasterModal={() => {
            this.setState({ successMasterChoosed: false });
            this.props.navigation.goBack(null);
          }}
        />
        <Modal
          animationType="slide"
          transparent={true}
          visible={this.state.clientModal && this.state.item.status === 'OPEN'}
        >
          <View
            style={{
              width: '100%',
              height: '100%',
              alignItems: 'center',
              justifyContent: 'center',
              paddingBottom: 20,
              backgroundColor: 'rgba(0,0,0,0.84)',
            }}
          >
            <View
              style={{
                width: '80%',
                paddingHorizontal: 30,
                paddingVertical: 15,
                borderRadius: 10,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#fff',
              }}
            >
              <Text allowFontScaling={false} style={styles.titleTextModal2}>
                {t('order:agreedWithMaster')}
              </Text>

              <Button
                onPress={() => {
                  this.setState({ clientModal: false });
                  if (this.state.masterId !== 0) {
                    this.chooseMaster(this.state.masterId);
                  }
                }}
                style={styles.buttonModal}
              >
                <Text
                  allowFontScaling={false}
                  style={{
                    width: '100%',
                    color: '#fff',
                    textAlign: 'center',
                    fontSize: 16,
                    fontWeight: '500',
                  }}
                >
                  {t('simple:yes')}
                </Text>
              </Button>
              <Button light onPress={() => this.setState({ clientModal: false })}>
                <Text
                  allowFontScaling={false}
                  style={{
                    width: '100%',
                    color: '#c20021',
                    textAlign: 'center',
                    fontSize: 16,
                    fontWeight: '500',
                  }}
                >
                  {t('simple:no')}
                </Text>
              </Button>
            </View>
          </View>
        </Modal>
      </Container>
    );
  }
}

class FlatListItem extends React.Component {
  state = {
    modalCallVisible: false,
  };

  renderPromo = () => {
    const { promos, last, index } = this.props;
    const promoIndex = last ? Math.ceil((index + 1) / 2) - 1 : (index + 1) / 2 - 1;
    const promo = promos[promoIndex];
    if (promo) {
      if (promo.fetching) {
        return <Spinner color="red" />;
      } else if (promo.image) {
        return <Promo promo={promo} navigateScreen="MarketIntoOrder" />;
      }
    } else {
      return null;
    }
  };

  pressCall = (username) => {
    const url = `tel://+7${username}`;
    Linking.openURL(url);
    if (this.props.canPickMaster) {
      setTimeout(() => this.setState({ modalCallVisible: true }), 4000);
    }
  };

  render() {
    const { item: comHistory, t, index, promos, last, navigate } = this.props;
    const item = comHistory.respondedMaster;

    console.log(this.props.promos.length);

    const onlineStatus = getLastOnline(item.lastRequest);

    return (
      item.status !== 'BLOCKED' && (
        <View>
          <TouchableWithoutFeedback
            onPress={() => {
              this.props.navigate({
                routeName: 'MasterProfileIntoOrder',
                params: { username: item.username, notShowCallButton: true },
              });
            }}
          >
            <View style={{ flex: 1 }}>
              <View style={styles.orderContainer}>
                <View
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <View style={styles.orderPerson}>
                    <Avatar
                      rounded
                      size="large"
                      icon={{ name: 'user', type: 'font-awesome' }}
                      activeOpacity={0.7}
                      source={{
                        uri: item.avatar
                          ? `${config.url}/images/${item.avatar.imageName}`
                          : 'https://media.istockphoto.com/photos/icon-of-a-businessman-avatar-or-profile-pic-picture-id474001892?k=6&m=474001892&s=612x612&w=0&h=6g0M3Q3HF8_uMQpYbkM9XAAoEDym7z9leencMcC4pxo=',
                      }}
                    />
                  </View>
                </View>
                <View style={styles.orderText}>
                  <Text
                    allowFontScaling={false}
                    style={{
                      color: 'black',
                      fontWeight: '500',
                      fontSize: 16,
                    }}
                  >
                    {item.firstName} {item.lastName}
                  </Text>
                  <View>
                    {onlineStatus === 'online' ? (
                      <Badge style={{ height: 20, marginBottom: 3 }} success>
                        <Text allowFontScaling={false} style={{ color: '#fff' }}>
                          {onlineStatus}
                        </Text>
                      </Badge>
                    ) : (
                      <Text allowFontScaling={false} style={{ color: '#999999' }}>
                        {onlineStatus}
                      </Text>
                    )}
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <View style={{ flexDirection: 'row' }}>
                        <AntDesign
                          name="star"
                          size={19}
                          color={item.rating > 20 ? '#c20021' : '#999999'}
                        />
                        <Text allowFontScaling={false} style={styles.specilization}>
                          {item.rating > 0 ? '+' : ''}
                          {item.rating}{' '}
                        </Text>
                      </View>
                      <View style={{ flexDirection: 'row' }}>
                        <Text allowFontScaling={false} style={styles.bottomGreyTexts}>
                          | {getUserRating(item.rating)}{' '}
                        </Text>
                      </View>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Image
                        source={
                          item.status === 'VERIFIED'
                            ? require('../../assets/images/checked.png')
                            : require('../../assets/images/unchecked.png')
                        }
                        style={{
                          width: 16,
                          height: 18,
                          marginLeft: 1,
                        }}
                      />
                      <Text
                        allowFontScaling={false}
                        style={[
                          styles.bottomGreyTexts,
                          {
                            marginTop: 2,
                            borderLeftColor: '#c1c3c7',
                            borderLeftWidth: 1,
                            paddingLeft: 5,
                            marginLeft: 3,
                          },
                        ]}
                      >
                        {t(`profile:${item.status}`)}{' '}
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
                    <Text allowFontScaling={false} style={styles.bottomGreyTexts}>
                      {getUserDuration(item.created)}
                    </Text>
                  </View>
                  <Text allowFontScaling={false} style={styles.bottomGreyTexts}>
                    {t('order:finishedOrders')}:{' '}
                    <Text allowFontScaling={false} style={{ fontWeight: '500', color: 'black' }}>
                      {item.masterOrderCount}
                    </Text>
                  </Text>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>

          <View style={styles.messageContainer}>
            {comHistory.communicationHistoryInfos.map((history, index) => {
              return (
                history.communicationType === 'MESSAGE' && (
                  <Text allowFontScaling={false} key={index}>
                    {t('order:wroteToYou')}: {getNamesLocal(history.text, history.textKz)}
                  </Text>
                )
              );
            })}
            {comHistory.communicationHistoryInfos.map((history, index) => {
              return (
                history.communicationType === 'CALL' && (
                  <View key={index} style={{ flexDirection: 'row' }}>
                    <Text allowFontScaling={false}>{t('order:calledToYou')}: </Text>
                    <Text allowFontScaling={false}>{getDateByMonth(history.created)}</Text>
                  </View>
                )
              );
            })}
          </View>
          <View
            style={{
              width: '90%',
              flexDirection: 'row',
              justifyContent: 'center',
              alignSelf: 'center',
              marginBottom: 10,
            }}
          >
            <Button
              light
              onPress={() => this.setState({ modalCallVisible: true })}
              style={{
                opacity: this.props.canPickMaster ? 1 : 0,
                marginRight: '2%',
                width: '48%',
                textAlign: 'center',
              }}
              disabled={!this.props.canPickMaster}
            >
              <Text
                allowFontScaling={false}
                style={{
                  color: '#c20021',
                  fontWeight: '500',
                  fontSize: 13,
                  textAlign: 'center',
                  width: '100%',
                }}
              >
                {t('simple:accept')}
              </Text>
            </Button>
            <Button
              danger
              style={{
                opacity: this.props.cantCall ? 0 : 1,
                marginLeft: '2%',
                width: '48%',
                backgroundColor: '#c20021',
                textAlign: 'center',
              }}
              onPress={() => this.pressCall(item.username)}
              disabled={this.props.cantCall}
            >
              <Text
                allowFontScaling={false}
                style={{
                  color: '#fff',
                  fontWeight: '500',
                  fontSize: 13,
                  textAlign: 'center',
                  width: '100%',
                }}
              >
                {t('simple:call')}
              </Text>
            </Button>
          </View>
          {this.props.last || (
            <View
              style={{
                backgroundColor: '#cadadd',
                height: 2,
                marginTop: 7,
                width: '95%',
                alignSelf: 'center',
              }}
            />
          )}
          <Modal animationType="slide" transparent={true} visible={this.state.modalCallVisible}>
            <View
              style={{
                width: '100%',
                height: '100%',
                alignItems: 'center',
                justifyContent: 'center',
                paddingBottom: 20,
                backgroundColor: 'rgba(0,0,0,0.84)',
              }}
            >
              <View
                style={{
                  width: '80%',
                  paddingHorizontal: 30,
                  paddingVertical: 15,
                  borderRadius: 10,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: '#fff',
                }}
              >
                <Text allowFontScaling={false} style={styles.titleTextModal2}>
                  {t('order:agreedWithMaster')}
                </Text>

                <Button
                  onPress={() => {
                    this.setState({ modalCallVisible: false });
                    this.props.chooseMaster(item.id);
                  }}
                  style={styles.buttonModal}
                >
                  <Text
                    allowFontScaling={false}
                    style={{
                      width: '100%',
                      color: '#fff',
                      textAlign: 'center',
                      fontSize: 16,
                      fontWeight: '500',
                    }}
                  >
                    {t('simple:yes')}
                  </Text>
                </Button>
                <Button light onPress={() => this.setState({ modalCallVisible: false })}>
                  <Text
                    allowFontScaling={false}
                    style={{
                      width: '100%',
                      color: '#c20021',
                      textAlign: 'center',
                      fontSize: 16,
                      fontWeight: '500',
                    }}
                  >
                    {t('simple:no')}
                  </Text>
                </Button>
              </View>
            </View>
          </Modal>
          {((index + 1) % 2 === 0 || last) && this.renderPromo()}
        </View>
      )
    );
  }
}

export default withNavigationFocus(
  connect(
    ({ modeReducer, authReducer, mastersOrderSpec }) => ({
      modeReducer,
      authReducer,
      mastersOrderSpec,
    }),
    { switchMode, setSpecName },
  )(hoistStatics(withTranslation()(HomeScreen), HomeScreen)),
);

const styles = StyleSheet.create({
  messageContainer: {
    width: '90%',
    alignSelf: 'center',
    backgroundColor: '#e3f7ff',
    borderRadius: 5,
    paddingLeft: 10,
    paddingRight: 30,
    paddingVertical: 4,
    marginVertical: 5,
  },
  notFocused: {
    color: '#999999',
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: '500',
    fontSize: 16,
  },
  focused: {
    color: '#c20021',
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: '500',
    fontSize: 16,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  filterButton: {
    paddingRight: 10,
  },
  developmentModeText: {
    marginBottom: 20,
    color: 'rgba(0,0,0,0.4)',
    fontSize: 14,
    lineHeight: 19,
    textAlign: 'center',
  },
  contentContainer: {
    paddingTop: 30,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  welcomeImage: {
    width: 100,
    height: 80,
    resizeMode: 'contain',
    marginTop: 3,
    marginLeft: -10,
  },
  getStartedContainer: {
    alignItems: 'center',
    marginHorizontal: 50,
  },
  homeScreenFilename: {
    marginVertical: 7,
  },
  codeHighlightText: {
    color: 'rgba(96,100,109, 0.8)',
  },
  codeHighlightContainer: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 3,
    paddingHorizontal: 4,
  },
  getStartedText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    lineHeight: 24,
    textAlign: 'center',
  },
  tabBarInfoContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    ...Platform.select({
      ios: {
        shadowColor: 'black',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 20,
      },
    }),
    alignItems: 'center',
    backgroundColor: '#fbfbfb',
    paddingVertical: 20,
  },
  tabBarInfoText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    textAlign: 'center',
  },
  navigationFilename: {
    marginTop: 5,
  },
  helpContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  helpLink: {
    paddingVertical: 15,
  },
  helpLinkText: {
    fontSize: 14,
    color: '#2e78b7',
  },

  orderContainer: {
    width: '95%',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexDirection: 'row',
    marginTop: 10,
    marginBottom: 4,
    paddingHorizontal: 15,
    paddingBottom: 15,
    marginLeft: '2.5%',
    paddingTop: 15,
    borderWidth: 2,
    borderColor: '#c20021',
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
    width: '80%',
    // justifyContent:'center',
    alignItems: 'center',
  },
  specilization: {
    fontWeight: '500',
    fontSize: 14,
  },
  orderText: {
    width: '70%',
    paddingLeft: 12,
  },
  bottomGreyTexts: {
    fontSize: 13,
    color: '#999999',
    lineHeight: 15,
  },
  titleTextModal: {
    fontSize: 20,
    marginBottom: 10,
    fontWeight: '500',
    width: '100%',
    borderBottomColor: '#e9f0f4',
    borderBottomWidth: 2,
    textAlign: 'left',
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
  describeTextModal: {
    fontSize: 16,
    fontWeight: '500',
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
