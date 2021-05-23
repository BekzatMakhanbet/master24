import { AntDesign, Octicons } from '@expo/vector-icons';
import Axios from 'axios';
import hoistStatics from 'hoist-non-react-statics';
import { Button, Spinner } from 'native-base';
import React, { Fragment } from 'react';
import { withTranslation } from 'react-i18next';
import {
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { OptimizedFlatList as FlatList } from 'react-native-optimized-flatlist';
import { connect } from 'react-redux';
import { switchMode } from '../../actions/modeActions';
import { addNotifications } from '../../actions/notificationActions';
import { setActiveTab } from '../../actions/setActiveTab';
import FinishedOrderReview from '../../components/ModalComponents/FinishedOrderReview';
import i18n from '../../i18n';
import { store } from '../../store';
import getDateByMonth from '../../utils/getDateByMonth';
import { getModeColor } from '../../utils/getModeColor';
import getNamesLocal from '../../utils/getNamesLocal';
import config from '../../config/config';

const { height } = Dimensions.get('window');

class NotificationsScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const { state } = navigation;
    return {
      title: i18n.t('menu:notifications'),
      headerLeft: (
        <TouchableOpacity onPress={navigation.openDrawer} style={{ paddingLeft: 10 }}>
          <Octicons size={26} name={'three-bars'} color="white" />
        </TouchableOpacity>
      ),
      headerStyle: {
        backgroundColor: state.params && state.params.color,
      },
      headerTitleStyle: {
        color: 'white',
      },
    };
  };

  state = {
    refreshing: false,
    spinning: false,
    mode: '',
    notifications: [],
    collapsed: false,
    finishedReviewVisible: false,
    orderText: '',
    reviewId: null,
  };

  componentDidMount() {
    this.setState({ spinning: false });
    const { mode } = this.props.modeReducer;
    if (mode != this.state.mode) {
      this.props.navigation.setParams({ color: getModeColor(mode) });
      this.setState({ mode });
    }
  }

  componentDidUpdate(props) {
    const { mode } = this.props.modeReducer;
    if (mode != this.state.mode) {
      this.props.navigation.setParams({ color: getModeColor(mode) });
      this.setState({ mode });
    }
  }

  clearAllNotifications = async () => {
    //Method to make All Notifications readed
    const { notifications } = this.props.notificationReducer;
    const notRead = [];
    notifications.forEach((element, index) => {
      if (element.status !== 'READ') {
        notRead.push(Axios.patch(`${config.url}/api/v1/push/read/${element.id}`));
      }
    });

    if (notRead.length) {
      this.setState({ spinning: true });
      Promise.all(notRead).then(() => this.getNotifications());
    }
  };

  navigateToOrder = (notification) => {
    //Method when User presses on Notification
    const { screen, mode, title } = notification.additionalProp1;

    if (notification.status !== 'READ') {
      //Makes Notification readed
      this.setState({ spinning: true });

      Axios.patch(
        `${config.url}/api/v1/push/read/${notification.id}`,
        {},
        {
          headers: {},
        },
      ).then(() => this.getNotifications());
    }

    if (screen && this.props.authReducer.loggedIn) {
      //Navigates only if Notification has the screen to Navigate
      if (this.props.modeReducer.mode !== mode) {
        this.props.switchMode();
      }

      if (title.includes('Откликнулся')) {
        //To Open Responds Tab of MyOrder screen
        notification.additionalProp2.openResponds = true;
      }

      if (title === 'Заказ завершен') {
        //To Show Up Modal window with Master Rating
        this.setState({
          reviewId: notification.additionalProp2.itemId,
          orderText: notification.additionalProp1.body,
          finishedReviewVisible: true,
        });
      } else if (screen === 'MyOrder' || screen === 'MyOrderFinished') {
        //Navigation with key to reset the Order Screens

        this.props.navigation.navigate({
          routeName: screen,
          params: notification.additionalProp2,
          key: 'from-not',
        });
      } else {
        this.props.navigation.navigate(screen, notification.additionalProp2);
      }
    }
  };

  getNotifications = () => {
    this.setState({ spinning: true });
    Axios.get(
      `${config.url}/api/v1/push/user/${this.props.authReducer.id}?mode=${this.props.modeReducer.mode}`,
    )
      .then((res) => {
        this.props.addNotifications(res.data.pushes);
        this.setState({ spinning: false });
      })
      .catch((err) => console.log('PUSH ERROR', err));
  };

  navigateToMyOrders = () => {
    this.setState({ finishedReviewVisible: false });
    this.props.setActiveTab(1);
    this.props.navigation.navigate('MyOrders');
  };

  render() {
    const { navigate } = this.props.navigation;
    const { mode } = this.props.modeReducer;
    const { t } = this.props;

    const { notifications } = store.getState().notificationReducer;
    if (mode != this.state.mode) {
      this.props.navigation.setParams({ color: getModeColor(mode) });
      this.setState({ mode });
    }

    let hasNot = false;
    let sortedNotifications = [];

    if (notifications) {
      notifications.map((nots) => {
        if (nots.status !== 'READ') {
          hasNot = true;
        }
      });

      sortedNotifications = notifications.sort((a, b) => a.id < b.id);
    }

    const spin = this.state.spinning || this.props.loadingReducer.loading;
    return (
      <>
        <FinishedOrderReview
          visibleModal={this.state.finishedReviewVisible}
          navigateToOrder={this.navigateToMyOrders}
          orderText={this.state.orderText}
          reviewId={this.state.reviewId}
        />
        <View style={{ justifyContent: 'space-between', height: height - 100 }}>
          {spin ? (
            <Spinner spinning={this.state.spinning} color="red" />
          ) : (
            <Fragment>
              <View
                style={{
                  height: hasNot ? height - 160 : height - 100,
                }}
              >
                <ScrollView
                  refreshControl={
                    <RefreshControl
                      //refresh control used for the Pull to Refresh
                      refreshing={this.state.spinning}
                      onRefresh={this.getNotifications}
                    />
                  }
                >
                  <View
                    style={{
                      width: '100%',
                      justifyContent: 'center',
                      paddingTop: 10,
                    }}
                  >
                    <FlatList
                      data={
                        this.state.collapsed ? sortedNotifications : sortedNotifications.slice(0, 6)
                      }
                      renderItem={({ item, index }) => {
                        return (
                          <FlatListItem
                            key={index}
                            item={item}
                            navigate={navigate}
                            index={index}
                            t={this.props.t}
                            navigateToOrder={this.navigateToOrder}
                          />
                        );
                      }}
                      keyExtractor={(item) => item.id + ''}
                    />
                    {notifications?.length === 0 && (
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
                        {t('simple:noNots')}
                      </Text>
                    )}
                  </View>
                  {notifications && notifications.length > 7 && (
                    <TouchableOpacity
                      onPress={() =>
                        this.setState({
                          collapsed: !this.state.collapsed,
                        })
                      }
                      style={{ alignSelf: 'center', marginVertical: 10 }}
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
                        {this.state.collapsed ? t('simple:close') : `+ ${t('simple:showMore')}`}
                      </Text>
                    </TouchableOpacity>
                  )}
                </ScrollView>
              </View>
              {hasNot && (
                <Button
                  onPress={() => this.clearAllNotifications(mode)}
                  style={{
                    backgroundColor: getModeColor(mode),
                    width: '95%',
                    alignSelf: 'center',
                    marginBottom: 10,
                  }}
                  block
                >
                  <Text allowFontScaling={false} style={{ color: '#fff', fontSize: 16 }}>
                    {t('simple:markAsRead')}
                  </Text>
                </Button>
              )}
            </Fragment>
          )}
        </View>
      </>
    );
  }
}

class FlatListItem extends React.Component {
  render() {
    const { item, t } = this.props;
    const { additionalProp1 } = item;

    return (
      <TouchableOpacity onPress={() => this.props.navigateToOrder(this.props.item)}>
        <View style={{ flex: 1 }}>
          <View style={styles.orderContainer}>
            <View
              style={{
                backgroundColor:
                  item.status === 'READ' ? '#e9f0f4' : getModeColor(additionalProp1.mode),
                borderRadius: 500,
                padding: 4,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AntDesign name={additionalProp1.type.toLowerCase()} color="#fff" size={16} />
            </View>
            <View style={{ marginLeft: 15 }}>
              <View style={{ flexDirection: 'row' }}>
                <Text
                  allowFontScaling={false}
                  style={{
                    fontWeight: '500',
                    fontSize: 16,
                    flexShrink: 1,
                    width: '90%',
                  }}
                >
                  {getNamesLocal(additionalProp1.title, additionalProp1.titleKz)}
                </Text>
              </View>
              <View style={{ flexDirection: 'row' }}>
                <Text
                  allowFontScaling={false}
                  style={{
                    fontWeight: '400',
                    fontSize: 14,
                    flexShrink: 1,
                    width: '90%',
                  }}
                >
                  {getNamesLocal(additionalProp1.body, additionalProp1.bodyKz)}
                </Text>
              </View>
              <View style={{ flexDirection: 'row' }}>
                <Text
                  allowFontScaling={false}
                  style={{
                    fontWeight: '500',
                    fontSize: 14,
                    color: '#999999',
                    flexShrink: 1,
                    width: '90%',
                  }}
                >
                  {t('simple:time')}: {getDateByMonth(item.created)}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }
}

export default connect(
  ({ authReducer, modeReducer, notificationReducer, loadingReducer }) => ({
    authReducer,
    modeReducer,
    notificationReducer,
    loadingReducer,
  }),
  { switchMode, addNotifications, setActiveTab },
)(hoistStatics(withTranslation()(NotificationsScreen), NotificationsScreen));

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  orderPerson: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  specilization: {
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 19,
  },
  orderText: {
    width: '73%',
    paddingLeft: 7,
  },
  orderContainer: {
    width: '95%',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    flexDirection: 'row',
    marginVertical: 5,
    paddingHorizontal: 10,
    paddingBottom: 10,
    marginLeft: '2.5%',
    paddingTop: 10,
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
  bottomGreyTexts: {
    fontSize: 15,
    color: '#c1c3c7',
    lineHeight: 16,
  },
});
