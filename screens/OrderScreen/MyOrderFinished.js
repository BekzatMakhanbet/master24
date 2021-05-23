import { AntDesign } from '@expo/vector-icons';
import axios from 'axios';
import hoistStatics from 'hoist-non-react-statics';
import { Badge, Button, Container, Spinner, TabHeading } from 'native-base';
import React from 'react';
import { withTranslation } from 'react-i18next';
import {
  BackHandler,
  Linking,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Avatar, Image } from 'react-native-elements';
import { withNavigationFocus } from 'react-navigation';
import { connect } from 'react-redux';
import { setSpecName } from '../../actions/mastersOrderSpecAction';
import { ErrorModal } from '../../components/ModalComponents/ErrorModal';
import { OrderFinishModal } from '../../components/ModalComponents/OrderFinishModal';
import { OrderFinishedModalComponent } from '../../components/ModalComponents/OrderFinsihedModalComponent';
import { SuccessMasterChoosed } from '../../components/ModalComponents/SuccessMasterChoosed';
import OrderComponent from '../../components/Orders/OrderComponent';
import i18n from '../../i18n';
import { switchMode } from '../../reducers/modeReducer';
import { store } from '../../store';
import getDateByMonth from '../../utils/getDateByMonth';
import getLastOnline from '../../utils/getLastOnline';
import { getModeColor } from '../../utils/getModeColor';
import getUserDuration from '../../utils/getUserDuration';
import getUserRating from '../../utils/getUserRating';
import sendPushNotification from '../../utils/sendPushNotification';
import config from '../../config/config';

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

class MyOrderFinishedScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const { state } = navigation;
    return {
      title: i18n.t('order:order'),
      headerLeft: (
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('MyOrders');
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
    const item = props.navigation.getParam('item', 0);
    const itemId = props.navigation.getParam('itemId', 0);
    const clientModal = props.navigation.getParam('clientModal', false);
    const masterId = props.navigation.getParam('masterId', 0);

    this.state = {
      mode: '',
      item,
      activeTab: 0,
      visibleModal: false,
      itemId,
      errorModal: false,
      finishModal: false,
      successMasterChoosed: false,
      clientModal,
      masterId,
      spinningFinish: false,
    };
  }

  componentDidMount() {
    const { mode } = this.props.modeReducer;
    if (mode != this.state.mode) {
      // this.props.navigation.setParams({ color: getModeColor(mode) });
      this.setState({ mode });
    }
    this.getSingleOrder();
    this.backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      this.props.navigation.navigate('MyOrders'); // works best when the goBack is async
      return true;
    });
  }

  componentDidUpdate(props) {
    const { mode } = this.props.modeReducer;
    if (mode != this.state.mode) {
      // this.props.navigation.setParams({ color: getModeColor(mode) });
      this.setState({ mode });
    }
    if (props.isFocused !== this.props.isFocused) {
      if (mode === 'master') {
        this.props.navigation.navigate('MyOrders');
      }
    }
  }

  componentWillUnmount() {
    this.backHandler.remove();
  }

  setVisibleModal = (value) => {
    this.setState({ visibleModal: value });
  };

  getSingleOrder = () => {
    axios.get(`${config.url}/api/v1/order?mode=SINGLE&order=${this.state.itemId}`).then((res) => {
      this.setState({ item: res.data.content[0] });
    });
  };

  cancelOrder = (id, cancellationReason) => {
    axios({
      method: 'PATCH',
      url: `${config.url}/api/v1/order/${id}`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: { status: 'CANCELLED', cancellationReason },
    })
      .then((res) => {
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

    this.setState({ spinningFinish: true });

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
        this.setState({ visibleModal: false, spinningFinish: false });
        this.props.navigation.navigate('MyOrders');
      })
      .catch((err) => {
        console.log(err);
      });
  };

  finishOrder = () => {
    this.setState({ finishModal: false, spinningFinish: true });
    axios({
      method: 'PATCH',
      url: `${config.url}/api/v1/order/${this.state.item.id}`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: { status: 'COMPLETED' },
    })
      .then((res) => {
        this.setState({
          visibleModal: true,
          finishModal: false,
          spinningFinish: false,
        });
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
    if (reviewId === null) {
      this.props.navigation.goBack(null);
    }
  };

  navigateToEdit = () => {
    this.props.navigation.navigate('EditOrder', {
      item: this.state.item,
    });
  };

  chooseMaster = (masterId) => {
    const options = {
      method: 'PUT',
      url: `${config.url}/api/v1/order/customer/${this.state.item.id}/select/${masterId}`,
    };
    axios(options)
      .then((res) => {
        axios({
          method: 'PATCH',
          url: `${config.url}/api/v1/order/${this.state.item.id}`,
          headers: {
            'Content-Type': 'application/json',
          },
          data: { status: 'IN_PROGRESS' },
        })
          .then((res) => {
            sendPushNotification(
              `на заказ №${this.state.item.id} «${this.state.item.description.substring(0, 20)}${
                this.state.item.description.length > 20 ? '...' : ''
              }»`,
              `тапсырыс №${this.state.item.id} «${this.state.item.description.substring(0, 20)}${
                this.state.item.description.length > 20 ? '...' : ''
              }»`,
              'Вас выбрали Мастером',
              'Сізді Шебер етіп таңдады',
              masterId,
              'MyOrderMaster',
              this.state.item.id,
              'master',
              'check',
            );
            this.setState({ successMasterChoosed: true });
          })
          .catch((err) => {
            console.log(err);
          });
      })
      .catch((err) => {
        this.setState({ errorModal: true });
      });
  };

  reopenOrder = () => {
    this.props.navigation.navigate('ReopenOrder', {
      item: this.state.item,
    });
  };

  render() {
    const { t } = this.props;
    let { activeTab } = this.state;
    const { navigate } = this.props.navigation;
    const finished =
      this.state.item.status === 'CANCELLED' || this.state.item.status === 'COMPLETED';

    const spin = this.state.item === 0 || this.state.spinningFinish;

    return !spin ? (
      <Container>
        {/* <Tabs
          onChangeTab={({ i }) => this.setState({ activeTab: i })}
          tabBarUnderlineStyle={{ backgroundColor: "#c20021", height: 4 }}
        >
          <Tab heading={TabText("Заказ", 12, activeTab, 0)}> */}
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
        {/* </Tab> */}
        {/* <Tab
            heading={TabText(
              "Отклики",
              this.state.item.communicationHistories
                ? this.state.item.communicationHistories.length
                : 0,
              activeTab,
              1
            )}
          >
            <ScrollView
              style={{ width: "100%" }}
              contentContainerStyle={{
                justifyContent: "center",
                flexGrow: 1,
                paddingBottom: 20
              }}
            >
              {this.state.spinning ? (
                <Spinner color="red" />
              ) : this.state.item.communicationHistories ? (
                <FlatList
                  data={this.state.item.communicationHistories}
                  renderItem={({ item, index }) => {
                    return (
                      <FlatListItem
                        last={
                          index + 1 ===
                          this.state.item.communicationHistories.length
                        }
                        chooseMaster={this.chooseMaster}
                        item={item}
                        cantCall={
                          this.state.item.status === "CANCELLED" ||
                          this.state.item.status === "COMPLETED"
                        }
                        navigate={navigate}
                        index={index}
                        t={this.props.t}
                        canPickMaster={!this.state.item.master}
                      ></FlatListItem>
                    );
                  }}
                  keyExtractor={item => item.id + ""}
                ></FlatList>
              ) : (
                <View
                  style={{
                    width: "90%",
                    height: 240,
                    alignSelf: "center",
                    alignItems: "center",
                    justifyContent: "space-between"
                  }}
                >
                  <Text
                    allowFontScaling={false}
                    style={{
                      textAlign: "center",
                      fontSize: 16,
                      fontWeight: "500",
                      marginVertical: 20,
                      color: "#999999"
                    }}
                  >
                    Нет откликов
                  </Text>
                </View>
              )}
            </ScrollView>
          </Tab> */}
        {/* </Tabs> */}
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
                Договорились с Мастером ?
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
    ) : (
      <Spinner color="red" />
    );
  }
}

class FlatListItem extends React.Component {
  state = {
    modalCallVisible: false,
  };

  pressCall = (username) => {
    const url = `tel://+7${username}`;
    Linking.openURL(url);
    if (this.props.canPickMaster) {
      setTimeout(() => this.setState({ modalCallVisible: true }), 4000);
    }
  };

  render() {
    const { item: comHistory, t } = this.props;
    const item = comHistory.respondedMaster;

    const onlineStatus = getLastOnline(item.lastRequest);

    return (
      <View>
        <TouchableOpacity
          onPress={() => {
            this.props.navigate('MasterProfileIntoOrder', {
              username: item.username,
              hasOrder: false,
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
                        item.status == 'VERIFIED'
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
                  Завершенные заказы:{' '}
                  <Text allowFontScaling={false} style={{ fontWeight: '500', color: 'black' }}>
                    {item.masterOrderCount}
                  </Text>
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.messageContainer}>
          {comHistory.communicationHistoryInfos.map((history, index) => {
            return (
              history.communicationType === 'MESSAGE' && (
                <Text allowFontScaling={false} key={index}>
                  Вам писали: {history.text}
                </Text>
              )
            );
          })}
          {comHistory.communicationHistoryInfos.map((history, index) => {
            return (
              history.communicationType === 'CALL' && (
                <View key={index} style={{ flexDirection: 'row' }}>
                  <Text allowFontScaling={false}>Вам звонили: </Text>
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
          }}
        >
          <Button
            light
            onPress={() => this.props.chooseMaster(item.id)}
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
              Принять
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
              Позвонить
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
                Договорились с Мастером ?
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
                  Да
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
                  Нет
                </Text>
              </Button>
            </View>
          </View>
        </Modal>
      </View>
    );
  }
}

export default withNavigationFocus(
  connect(
    ({ modeReducer, authReducer, masterOrderSpec }) => ({
      modeReducer,
      authReducer,
      masterOrderSpec,
    }),
    { switchMode, setSpecName },
  )(hoistStatics(withTranslation()(MyOrderFinishedScreen), MyOrderFinishedScreen)),
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
  },
  focused: {
    color: '#c20021',
    textAlign: 'center',
    marginBottom: 10,
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
