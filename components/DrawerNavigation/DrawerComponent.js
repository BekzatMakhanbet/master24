import { AntDesign } from '@expo/vector-icons';
import NetInfo from '@react-native-community/netinfo';
import axios from 'axios';
import { Linking, Notifications } from 'expo';
import * as Permissions from 'expo-permissions';
import React, { Fragment, PureComponent } from 'react';
import { withTranslation } from 'react-i18next';
import {
  AsyncStorage,
  Dimensions,
  Image,
  Modal,
  Platform,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
  YellowBox,
} from 'react-native';
import { Avatar, Badge } from 'react-native-elements';
import SafeAreaView from 'react-native-safe-area-view';
import { connect } from 'react-redux';
import { changeAppState } from '../../actions/appStateActions';
import { login, logout } from '../../actions/authActions';
import { switchMode } from '../../actions/modeActions';
import { addNotifications, setLoading } from '../../actions/notificationActions';
import { setActiveTab } from '../../actions/setActiveTab';
import MasterSlides from '../../screens/InfoSlides/MasterSlides';
import SlidesClient from '../../screens/InfoSlides/SlidesClient';
import getFontSize from '../../utils/getFontSize';
import { getModeColor } from '../../utils/getModeColor';
import getNamesLocal from '../../utils/getNamesLocal';
import getUserRating from '../../utils/getUserRating';
import increaseViewCount from '../../utils/increaseViewCount';
import FinishedOrderReview from '../ModalComponents/FinishedOrderReview';
import config from '../../config/config';

YellowBox.ignoreWarnings(['Setting a timer', 'VirtualizedLists should never be nested']);
console.ignoredYellowBox = ['Setting a timer', 'VirtualizedLists should never be nested'];

const { width, height } = Dimensions.get('window');
var interval;

class CustomDrawerContentComponent extends PureComponent {
  state = {
    switch: false,
    active: 5,
    user: '',
    loggedIn: false,
    noNetowrk: false,
    firstClientModal: false,
    firstMasterModal: false,
    mode: '',
    masterPromo: null,
    customerPromo: null,
    finishedReviewVisible: false,
    orderText: '',
    reviewId: null,
  };

  handleSwitch = (e) => {
    //Handle switch of Modes(Customer or Master)
    const { master, loggedIn } = this.props.authReducer;
    //Check for logged in or no
    if (loggedIn) {
      if (master || this.props.modeReducer.mode === 'master') {
        //If the user already Master switch Mode or navigate to Register Master
        this.props.switchMode();
        this.props.navigation.closeDrawer();
        if (this.props.modeReducer.mode === 'master') {
          //Switch Mode to Customer
          this.props.navigation.navigate({
            routeName: 'MyOrders',
          });
          this.setState({ active: 1 });
        } else {
          //Switch Mode to Master
          this.props.navigation.navigate({
            routeName: 'MasterListOrders',
          });
          this.setState({ active: 2 });
        }
      } else {
        if (!this.props.appStateReducer.firstMaster) {
          //Show the slides of First Master Login
          this.setState({ firstMasterModal: true });
        } else {
          this.props.navigation.navigate('RegisterMaster');
        }
      }
    } else {
      this.props.navigation.navigate('LogInClient');
    }
  };

  componentDidMount() {
    this.timerID = setInterval(() => this.setStatusOnline(), 60000);
    this.setState({ loggedIn: this.props.authReducer.loggedIn });
    const { loggedIn } = this.props.authReducer;

    if (this.props.authReducer.loggedIn) {
      clearInterval(interval);
      this.getNotifications();
      this.refresh();
    }

    const { firstClient } = this.props.appStateReducer;

    if (!firstClient) {
      //Show the slides of first CLient Login
      this.setState({ firstClientModal: true });
    }

    NetInfo.addEventListener((connection) => {
      //Handle the Network Inforamtion of User
      const { isConnected } = connection;
      this.setState({ noNetowrk: !isConnected });
    });

    //Handle the app linking for Android OS
    Linking.getInitialURL().then((name) => {
      const { path, queryParams } = Linking.parse(name);

      if (path) {
        const navigatePath = path.includes(config.appHost) ? path.split('/--/')[1] : path;

        if (this.props.modeReducer.mode === 'master') {
          this.props.switchMode();
        }
        this.props.navigation.navigate(navigatePath, queryParams);
      }
    });
    //Handle the App Linking for IOS and For Android if app is already opened
    Linking.addEventListener('url', this.onLinkingUrl);

    Notifications.addListener((receivedNotification) => {
      //Handle the Push Notifications
      const { screen, mode, title } = receivedNotification.data.additionalProp1;
      //Get the screen to navigate and for which mode(customer or master)
      if (Platform.OS === 'ios') {
        if (screen && loggedIn) {
          if (this.props.modeReducer.mode !== mode) {
            this.props.switchMode();
          }

          //Check the Notifications Screen
          const { routes } = this.props.navigation.state;

          if (title === 'Заказ завершен') {
            this.setState({
              reviewId: receivedNotification.data.additionalProp2.itemId,
              orderText: receivedNotification.data.additionalProp1.body,
              finishedReviewVisible: true,
            });
          } else {
            if (screen === 'MyOrder' && routes[1] && routes[1].routes.length > 0) {
              this.props.navigation.navigate('MyOrders');
            }

            if (title.includes('Откликнулся')) {
              receivedNotification.data.additionalProp2.openResponds = true;
            }

            this.props.navigation.navigate(
              screen,
              receivedNotification.data.additionalProp2,
              'from-not',
            );
          }
        }
        Notifications.dismissNotificationAsync(receivedNotification.notificationId);
        axios
          .patch(`${config.url}/api/v1/push/read/${receivedNotification.data.pushId}`)
          .then(() => this.getNotifications());
      }

      if (receivedNotification.origin === 'selected') {
        if (screen && loggedIn) {
          if (this.props.modeReducer.mode !== mode) {
            this.props.switchMode();
          }

          const { routes } = this.props.navigation.state;

          if (title === 'Заказ завершен') {
            this.setState({
              reviewId: receivedNotification.data.additionalProp2.itemId,
              orderText: receivedNotification.data.additionalProp1.body,
              finishedReviewVisible: true,
            });
          } else {
            if (screen === 'MyOrder' && routes[1] && routes[1].routes.length > 0) {
              this.props.navigation.navigate('MyOrders');
            }

            if (title.includes('Откликнулся')) {
              receivedNotification.data.additionalProp2.openResponds = true;
            }

            this.props.navigation.navigate(
              screen,
              receivedNotification.data.additionalProp2,
              'from-not',
            );
          }
        }
        Notifications.dismissNotificationAsync(receivedNotification.notificationId);
        axios
          .patch(`${config.url}/api/v1/push/read/${receivedNotification.data.pushId}`, {})
          .then(() => this.getNotifications());
      }
      this.getNotifications();
    });

    if (!loggedIn) {
      this.setState({ active: -1 });
      this.props.navigation.navigate('LogInClient');
    } else {
      if (this.props.modeReducer.mode === 'master') {
        this.props.navigation.navigate('MasterListOrders');
      }
    }
  }

  onLinkingUrl = (link) => {
    const { path, queryParams } = Linking.parse(link.url);

    if (path) {
      const navigatePath = path.includes(config.appHost) ? path.split('/--/')[1] : path;

      if (this.props.modeReducer.mode === 'master') {
        this.props.switchMode();
      }
      this.props.navigation.navigate(navigatePath, queryParams);
    }
  };

  navigateToMyOrders = () => {
    this.setState({ finishedReviewVisible: false });
    this.props.setActiveTab(1);
    this.props.navigation.navigate('MyOrders');
  };

  componentWillUnmount() {
    Linking.removeEventListener('url', this.onLinkingUrl);
    clearInterval(this.timerID);
  }

  setStatusOnline = () => {
    if (this.state.user?.id && this.props.authReducer.loggedIn) {
      axios.post(`${config.url}/api/v1/user/activity/${this.state.user.id}`);
    }
  };

  componentWillReceiveProps = (nextProps) => {
    //Interval of Online User
    const { loggedIn } = nextProps.authReducer;
    if (loggedIn !== this.state.loggedIn) {
      if (!loggedIn) {
        this.setState({ user: '', loggedIn });
        clearInterval(interval);
      } else {
        this.setState({ loggedIn: true });
      }
    }

    //On Switching Mode refresh the Notifications
    if (this.props.modeReducer.mode !== this.state.mode) {
      if (loggedIn) {
        this.setState({ mode: this.props.modeReducer.mode });
        this.getNotifications();
      }
    }

    //Information About Is Drawer Opened or Not And fetch the promos
    const { isDrawerOpen } = nextProps.navigation.state;
    if (this.state.isDrawerOpen !== isDrawerOpen) {
      this.setState({ isDrawerOpen });
      if (isDrawerOpen === true) {
        axios
          .get(
            `http://91.201.215.45:49153/api/v1/promo/side?displayType=${
              this.props.modeReducer.mode === 'client' ? 'CUSTOMER' : 'MASTER'
            }&city=${this.props.authReducer?.city?.id}`,
          )
          .then((res) => {
            if (this.props.modeReducer.mode === 'client') {
              this.setState({
                customerPromo: res.data,
              });
            } else {
              this.setState({
                masterPromo: res.data,
              });
            }
          });
      }
    }

    switch (nextProps.navigation.state.index) {
      //Active menu items by drawer navigation indexes
      case 0:
        this.setState({ active: 0 });
        break;
      case 1:
        this.setState({ active: 1 });
        break;
      case 2:
        this.setState({ active: 2 });
        break;
      case 3:
        this.setState({ active: 2 });
        break;
      case 4:
        this.setState({ active: 3 });
        break;
      case 5:
        this.setState({ active: 3 });
        break;
      case 6:
        this.setState({ active: 4 });
        break;
      case 7:
        this.setState({ active: 5 });
        break;
      default:
        break;
    }
  };

  getNotifications = () => {
    //Fetch Notifications
    if (this.props.authReducer.loggedIn) {
      this.props.setLoading(true);
      axios
        .get(
          `${config.url}/api/v1/push/user/${this.props.authReducer.id}?mode=${this.props.modeReducer.mode}`,
        )
        .then((res) => {
          this.props.addNotifications(res.data.pushes);
          this.props.setLoading(false);
        })
        .catch((err) => console.log('PUSH ERROR', err));
    }
  };

  refresh = () => {
    //Refresh the User and Push Token(Push Token will be on that phone which you used last)
    clearInterval(interval);
    axios
      .get(`${config.url}/api/v1/user/${this.props.authReducer.username}`)
      .then(async (res) => {
        if (res.data.status === 'BLOCKED') {
          axios({
            method: 'PATCH',
            url: `${config.url}/api/v1/push/token`,
            data: {
              token: 'gg',
              userId: res.data.id,
            },
          })
            .then(() => console.log('Удалил'))
            .catch((err) => console.log(err));

          this.props.logout();

          this.props.navigation.navigate('LogInClient');
        } else {
          console.log('LOGGED SET');

          if (res.data.pushAllowed === false) {
            interval = setInterval(this.getNotifications, 20000);
          }
          this.setState({ user: res.data, refreshing: false });
          console.log('refreshed by drawer');

          this.props.login(
            true,
            res.data.firstName,
            res.data.lastName,
            res.data.sex,
            res.data.city,
            res.data.username,
            res.data.id,
            res.data.master,
            this.props.authReducer.token,
            res.data.avatar,
            res.data.specializations,
          );

          await Permissions.askAsync(Permissions.NOTIFICATIONS);
          let push_token = await Notifications.getExpoPushTokenAsync();

          if (Platform.OS === 'android') {
            Notifications.createChannelAndroidAsync('chat-messages', {
              name: 'chat-messages',
              sound: true,
              vibrate: true,
            });
          }

          this.setStatusOnline();

          axios.patch(`${config.url}/api/v1/push/token`, {
            token: push_token,
            userId: res.data.id,
          });
        }
      })
      .catch((err) => {
        console.log('REFRESH ERR', err);
        if (err.response.status === 500) {
          this.clearAsync();
        } else if (err.response.status === 400) {
          this.props.logout();
        }
      });
  };

  clearAsync = async () => {
    //Clear the cache
    const asyncStorageKeys = await AsyncStorage.getAllKeys();
    if (asyncStorageKeys.length > 0) {
      AsyncStorage.clear();
      this.props.navigation.navigate('LogInClient');
    }
  };

  render() {
    const { navigation, t } = this.props;
    const { active, user } = this.state;
    const client_navigation = [
      { id: 0, title: t('menu:createOrder'), navigateTo: 'CreateOrder' },
      { id: 1, title: t('menu:myOrders'), navigateTo: 'MyOrders' },
      { id: 2, title: t('menu:allMasters'), navigateTo: 'ListOrders' },
      {
        id: 3,
        title: t('menu:notifications'),
        navigateTo: 'Notifications',
      },
    ];
    const master_navigation = [
      {
        id: 2,
        title: t('menu:orderList'),
        navigateTo: 'MasterListOrders',
      },
      { id: 1, title: t('menu:myOrders'), navigateTo: 'MyOrders' },
      {
        id: 3,
        title: t('menu:notifications'),
        navigateTo: 'Notifications',
      },
    ];

    const mode = this.props.modeReducer.mode !== 'client';
    const { loggedIn, name, surname, city } = this.props.authReducer;

    let hasNot = false;

    let unreadNot = 0;

    this.props.notificationReducer &&
      this.props.notificationReducer.notifications &&
      this.props.notificationReducer.notifications.map((not) => {
        if (not.status !== 'READ') {
          hasNot = true;
          unreadNot++;
        }
      });

    return (
      <SafeAreaView style={styles.container} forceInset={{ top: 'always', horizontal: 'never' }}>
        <View style={styles.userSection}>
          <View
            style={{
              width: '100%',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              paddingHorizontal: 25,
            }}
          >
            <TouchableOpacity
              onPress={() => {
                if (loggedIn) {
                  this.setState({ active: -1 });
                  navigation.closeDrawer();
                  this.props.navigation.navigate('Profile');
                }
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                width: '60%',
              }}
            >
              <View>
                <Avatar
                  rounded
                  size={getFontSize(70)}
                  icon={{
                    name: 'user',
                    type: 'font-awesome',
                  }}
                  activeOpacity={0.7}
                  source={{
                    uri: loggedIn
                      ? this.props.authReducer.avatar
                        ? `${config.url}/images/${this.props.authReducer.avatar.imageName}`
                        : 'https://media.istockphoto.com/photos/icon-of-a-businessman-avatar-or-profile-pic-picture-id474001892?k=6&m=474001892&s=612x612&w=0&h=6g0M3Q3HF8_uMQpYbkM9XAAoEDym7z9leencMcC4pxo='
                      : 'https://media.istockphoto.com/photos/icon-of-a-businessman-avatar-or-profile-pic-picture-id474001892?k=6&m=474001892&s=612x612&w=0&h=6g0M3Q3HF8_uMQpYbkM9XAAoEDym7z9leencMcC4pxo=',
                  }}
                />
                <Badge
                  status={loggedIn ? 'success' : ''}
                  containerStyle={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                  }}
                />
              </View>
              <View style={{ paddingLeft: 10, paddingRight: 10 }}>
                {loggedIn ? (
                  <Fragment>
                    <Text allowFontScaling={false} style={styles.name}>{`${name &&
                      name} ${surname && surname}`}</Text>
                    {this.props.modeReducer.mode === 'client' ? (
                      <>
                        <Text allowFontScaling={false} style={styles.city}>{`${city &&
                          getNamesLocal(city.cityName, city.cityNameKz)}`}</Text>
                      </>
                    ) : (
                      <View style={styles.row}>
                        <View style={styles.row}>
                          <AntDesign
                            name="star"
                            size={19}
                            color={user.rating > 20 ? '#0288c7' : '#999999'}
                          />
                          <Text allowFontScaling={false} style={styles.info}>
                            {user.rating > 0 ? '+' : ''}
                            {user.rating}{' '}
                          </Text>
                        </View>
                        <View style={styles.row}>
                          <Text allowFontScaling={false} style={styles.info}>
                            | {getUserRating(user.rating)}{' '}
                          </Text>
                        </View>
                      </View>
                    )}
                    {/* <View style={{flexDirection:'row',paddingTop:5}}><Text allowFontScaling={false} style={styles.bonus}>Бонус:</Text><Text allowFontScaling={false} style={{color:'black',fontSize:16}}>500 тг</Text></View> */}
                  </Fragment>
                ) : (
                  <View style={styles.row}>
                    <TouchableOpacity
                      onPress={() => {
                        navigation.navigate('LogInClient');
                        this.setState({
                          active: -1,
                        });
                      }}
                    >
                      <Text allowFontScaling={false} style={styles.name}>
                        {t('login:signIn')} / {t('login:register')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </TouchableOpacity>
            <View style={{ justifyContent: 'flex-start' }}>
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate('Configuration');
                  this.setState({ active: -1 });
                }}
              >
                <AntDesign name="setting" size={getFontSize(26)} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <View style={styles.menuSection}>
          {mode
            ? master_navigation.map((item) => {
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.activeItems}
                    onPress={() => {
                      navigation.closeDrawer();
                      navigation.navigate(item.navigateTo);
                      this.setState({ active: item.id });
                    }}
                  >
                    <Text
                      allowFontScaling={false}
                      style={active === item.id ? styles.textActiveMaster : styles.text}
                    >
                      {item.title}{' '}
                    </Text>
                    {item.id === 3 && hasNot && <Badge value={unreadNot} status="error" />}
                  </TouchableOpacity>
                );
              })
            : client_navigation.map((item, index) => {
                return (index === 0 || index === 1) && !loggedIn ? (
                  <TouchableOpacity key={item.id} style={styles.activeItems}>
                    <Text allowFontScaling={false} style={styles.notLoggedInText}>
                      {item.title}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.activeItems}
                    onPress={() => {
                      navigation.closeDrawer();
                      navigation.navigate(item.navigateTo);
                      this.setState({ active: item.id });
                    }}
                  >
                    <Text
                      allowFontScaling={false}
                      style={active === item.id ? styles.textActiveClient : styles.text}
                    >
                      {item.title}{' '}
                    </Text>
                    {item.id === 3 && hasNot && <Badge value={unreadNot} status="error" />}
                  </TouchableOpacity>
                );
              })}
          <TouchableOpacity
            style={styles.activeItems}
            onPress={() => {
              navigation.closeDrawer();
              navigation.navigate('HowWorks');
              this.setState({ active: 4 });
            }}
          >
            <Text
              allowFontScaling={false}
              style={
                active === 4
                  ? !mode
                    ? styles.textActiveClient
                    : styles.textActiveMaster
                  : styles.text
              }
            >
              {t('menu:howItWorks')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.news}
            onPress={() => {
              navigation.closeDrawer();
              navigation.navigate('News');
              this.setState({ active: 5 });
            }}
          >
            <Text
              allowFontScaling={false}
              style={
                active === 5
                  ? !mode
                    ? styles.textActiveClient
                    : styles.textActiveMaster
                  : styles.text
              }
            >
              {t('menu:news')}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.switchSection}>
          <View style={{ flexDirection: 'row' }}>
            <Text
              allowFontScaling={false}
              style={
                mode
                  ? {
                      fontSize: getFontSize(17),
                      fontWeight: '500',
                      paddingRight: 5,
                      borderRightColor: '#c20021',
                      borderRightWidth: 2,
                      color: '#d1d1d1',
                    }
                  : {
                      fontSize: getFontSize(17),
                      fontWeight: '500',
                      paddingRight: 5,
                      borderRightColor: '#c20021',
                      borderRightWidth: 2,
                    }
              }
            >
              {t('menu:customer')}
            </Text>
            <Text
              allowFontScaling={false}
              style={
                mode
                  ? {
                      fontSize: getFontSize(17),
                      fontWeight: '500',
                      paddingLeft: 5,
                      borderLeftColor: '#c20021',
                      borderLeftWidth: 1,
                    }
                  : {
                      fontSize: getFontSize(17),
                      fontWeight: '500',
                      paddingLeft: 5,
                      borderLeftColor: '#c20021',
                      borderLeftWidth: 1,
                      color: '#d1d1d1',
                    }
              }
            >
              {t('menu:master')}
            </Text>
          </View>

          <Switch
            onValueChange={(e) => this.handleSwitch(e)}
            value={mode}
            thumbColor="#c20021"
            trackColor="#c20021"
          />
        </View>
        <View style={{ marginTop: getFontSize(20) }}>
          <TouchableOpacity
            onPress={() => {
              if (this.props.modeReducer.mode === 'client' && this.state.customerPromo) {
                if (this.state.customerPromo.marketId) {
                  increaseViewCount('SIDE_FOLLOW', this.state.customerPromo.id);

                  this.props.navigation.navigate('MarketMainProfileClientAll', {
                    marketId: this.state.customerPromo.marketId,
                  });
                }
              } else if (this.props.modeReducer.mode === 'master' && this.state.masterPromo) {
                if (this.state.masterPromo.marketId) {
                  increaseViewCount('SIDE_FOLLOW', this.state.masterPromo.id);

                  this.props.navigation.navigate('MarketMain', {
                    marketId: this.state.masterPromo.marketId,
                  });
                }
              }
            }}
          >
            <Image
              source={{
                uri:
                  this.props.modeReducer.mode === 'client'
                    ? this.state.customerPromo
                      ? `${config.url}/images/${this.state.customerPromo.image.imageName}`
                      : config.defaultImage
                    : this.state.masterPromo
                    ? `${config.url}/images/${this.state.masterPromo.image.imageName}`
                    : config.defaultImage,
              }}
              style={{ width: width * 0.88, height: getFontSize(250) }}
            />
          </TouchableOpacity>
        </View>
        <Modal animationType="fade" transparent={false} visible={this.state.noNetowrk}>
          <SafeAreaView>
            <View
              style={{
                width,
                height,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {this.props.modeReducer.mode === 'master' ? (
                <Image
                  style={{ width: 637 / 3, height: 611 / 3 }}
                  source={require('../../assets/images/noNetworkInternetMaster.png')}
                />
              ) : (
                <Image
                  style={{ width: 212, height: 204 }}
                  source={require('../../assets/images/noNetworkInternet.png')}
                />
              )}
              <Text
                allowFontScaling={false}
                style={{
                  fontSize: 21,
                  width: '70%',
                  fontWeight: '600',
                  textAlign: 'center',
                }}
              >
                Нет соединения с интернетом
              </Text>
              <Text
                allowFontScaling={false}
                style={{
                  fontSize: 15,
                  width: '90%',
                  fontWeight: '400',
                  color: '#999999',
                  textAlign: 'center',
                }}
              >
                Убедитесь что вы подключены к сети сотовых данных или Wi-Fi, и попробуйте еще раз
              </Text>
            </View>
          </SafeAreaView>
        </Modal>
        <SlidesClient
          firstClientModal={this.state.firstClientModal}
          closeModalFirstClient={() => {
            this.props.changeAppState(true, this.props.appStateReducer.firstMaster);
            this.setState({ firstClientModal: false, active: -1 });
            this.props.navigation.navigate('MyOrders');
          }}
        />
        <MasterSlides
          firstMasterModal={this.state.firstMasterModal}
          closeModalFirstMaster={() => {
            this.props.changeAppState(this.props.appStateReducer.firstClient, true);
            this.setState({ firstMasterModal: false, active: 1 });
            this.props.navigation.navigate('RegisterMaster');
          }}
        />
        <FinishedOrderReview
          visibleModal={this.state.finishedReviewVisible}
          navigateToOrder={this.navigateToMyOrders}
          orderText={this.state.orderText}
          reviewId={this.state.reviewId}
        />
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    height,
    justifyContent: 'space-between',
  },
  userSection: {
    paddingTop: getFontSize(15),
    paddingBottom: getFontSize(15),
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  menuSection: {
    backgroundColor: '#e9f0f4',
  },
  name: {
    fontWeight: '600',
    fontSize: getFontSize(18),
    // width: '60%',
  },
  city: {
    fontWeight: '400',
    fontSize: getFontSize(15),
  },
  bonus: {
    fontSize: 15,
    color: 'grey',
  },
  switchSection: {
    marginTop: getFontSize(10),
    height: 25,
    paddingHorizontal: 25,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  activeItems: {
    paddingVertical: getFontSize(8),
    paddingHorizontal: 25,
    fontSize: getFontSize(20),
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    fontSize: getFontSize(19),
    fontWeight: '400',
  },
  textActiveClient: {
    fontSize: getFontSize(19),
    color: getModeColor('client'),
    fontWeight: '500',
  },
  notLoggedInText: {
    fontSize: 16,
    color: '#999999',
    fontWeight: '400',
  },
  textActiveMaster: {
    fontSize: getFontSize(19),
    color: getModeColor('master'),
    fontWeight: '500',
  },
  news: {
    paddingVertical: getFontSize(10),
    width: '94%',
    marginLeft: '3%',
    paddingHorizontal: 15,
    borderTopWidth: 1.5,
    borderTopColor: '#a1a1a1',
    marginTop: height / 16,
  },
  exit: {
    alignSelf: 'center',
    backgroundColor: '#c20021',
    width: 200,
    height: 30,
    borderRadius: 10,
  },
  exitText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '500',
    fontSize: 16,
    paddingTop: 4,
  },
  row: {
    flexDirection: 'row',
  },
  info: {
    fontWeight: '400',
    fontSize: getFontSize(15),
    color: '#999999',
    textAlign: 'center',
  },
});

export default connect(
  ({ modeReducer, authReducer, notificationReducer, appStateReducer }) => ({
    modeReducer,
    authReducer,
    notificationReducer,
    appStateReducer,
  }),
  {
    switchMode,
    login,
    logout,
    addNotifications,
    changeAppState,
    setLoading,
    setActiveTab,
  },
)(withTranslation()(CustomDrawerContentComponent));
