import { Octicons } from '@expo/vector-icons';
import axios from 'axios';
import { Container, Spinner, Tab, Tabs } from 'native-base';
import React, { Fragment } from 'react';
import {
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NavigationEvents } from 'react-navigation';
import { connect } from 'react-redux';
import { setSpecName } from '../../actions/mastersOrderSpecAction';
import { switchMode } from '../../actions/modeActions';
import EmptyText from '../../components/EmptyText';
import Guides from '../../components/Guides/Guides';
import MasterRespondsListItem from '../../components/MasterRespondsListItem';
import OrderListItem from '../../components/OrderListItem';
import Promo from '../../components/Promo';
import TabText from '../../components/TabText';
import config from '../../config/config';
import wrapToHoc from '../../hoc/wrapToHoc';
import i18n from '../../i18n';
import { store } from '../../store';
import { getModeColor } from '../../utils/getModeColor';

class OrderListMaster extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const { state } = navigation;
    return {
      title: i18n.t('menu:orderList'),
      headerRight: <Guides screenName="OrderList" />,
      headerLeft: (
        <TouchableOpacity onPress={navigation.openDrawer} style={styles.openDrawerButton}>
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

  state = {
    mode: '',
    activeTab: 0,
    finished: [],
    notFinished: [],
    refreshing: false,
    spinningFirst: true,
    spinningMore: false,
    spinningSecond: true,
    error: '',
    specs: [],
    page: 0,
    promos: [],
    watched: [],
    watchedEnd: false,
    specsPromo: '',
  };

  viewabilityConfig = {
    viewAreaCoveragePercentThreshold: 10,
  };

  componentDidMount() {
    this.props.navigation.setParams({ visible: true });
    const { mode } = this.props.modeReducer;
    if (mode !== this.state.mode) {
      this.props.navigation.setParams({ color: getModeColor(mode) });
      this.setState({ mode });
    }
  }

  refresh = () => {
    const { id, specializations, city } = this.props.authReducer;
    let specs = '';
    let specsPromo = '';

    // Generate the specialication Query Parametres
    if (specializations) {
      for (let i = 0; i < specializations.length; i++) {
        specs += `spec=${specializations[i].id}&`;
        specsPromo += `specIds=${specializations[i].id}&`;
      }
      specs = specs.substring(0, specs.lastIndexOf('&'));
      specsPromo = specsPromo.substring(0, specsPromo.lastIndexOf('&'));
    }

    this.setState({ specsPromo, watched: [], watchedEnd: false, promos: [] });

    axios
      .get(`${config.url}/api/v1/history/responded-master/${id}`, {})
      .then((res5) => {
        var sort = res5.data.communicationHistories.slice(0).reverse();
        sort.sort((a, b) => {
          return a.id - b.id;
        });
        this.setState({
          finished: sort.reverse(),
          spinningSecond: false,
        });
      })
      .catch((err) => {
        console.log(err);
        this.setState({
          spinningSecond: false,
        });
      });

    axios
      .get(
        `${config.url}/api/v1/order?mode=SPEC&${specs}&status=OPEN&status=IN_PROGRESS&orderBy=ID&direction=desc&page=${this.state.page}&city=${city.id}`,
      )
      .then((res) => {
        //According to which page concat or set order value(It is a pagination for orders)
        if (this.state.page === 0 && res.data.content.length > 0) {
          this.setState({
            spinningFirst: false,
            notFinished: res.data,
            spinningMore: false,
          });
        } else {
          if (res.data.content.length <= 3 && res.data.content.length > 0) {
            const update = this.state.notFinished.content.concat(res.data.content);
            res.data.content = update;

            this.setState({
              spinningFirst: false,
              notFinished: res.data,
              spinningMore: false,
            });
          } else if (res.data.content.length >= 4 && res.data.content.length > 0) {
            const update = this.state.notFinished.content.concat(res.data.content);
            res.data.content = update;

            this.setState({
              spinningFirst: false,
              notFinished: res.data,
              spinningMore: false,
            });
          } else {
            this.setState({
              spinningFirst: false,
              notFinished: res.data,
            });
          }
        }
      });
  };

  componentDidUpdate(props) {
    const { mode } = this.props.modeReducer;
    if (mode !== this.state.mode) {
      if (mode === 'client') {
        this.props.navigation.navigate({
          routeName: 'MyOrders',
        });
      }
      this.props.navigation.setParams({ color: getModeColor(mode) });
      this.setState({ mode });
    }
  }

  refreshMethod = () => {
    this.setState({ page: 0, spinningFirst: true, spinningSecond: true }, () => {
      this.refresh();
    });
  };

  loadNextScreen = () => {
    this.setState({ page: this.state.page + 1, spinningMore: true }, () => {
      this.refresh();
    });
  };

  onChangeTab = ({ i }) => {
    this.setState({ activeTab: i }, () => {
      if (this.state.activeTab === 1) {
        this.props.navigation.setParams({ visible: false });
      } else {
        this.props.navigation.setParams({ visible: true });
      }
    });
  };

  fetchPromos = (index) => {
    const promoIndex = index / 3 - 1;
    const { promos } = this.state;
    if (!promos[promoIndex]) {
      promos[promoIndex] = { fetching: true };
      this.setState({ promos });
      axios
        .get(
          `${config.url}/api/v1/promo/spec?count=1&${this.state.specsPromo}&displayType=MASTER&city=${this.props.authReducer.city.id}`,
        )
        .then(({ data }) => {
          promos[promoIndex] = data[0];
          this.setState({ promos });
        });
    }
  };

  onViewableItemsChanged = ({ viewableItems }) => {
    //When Scrolling fetch Promos by indexes of items(Each third order will be with promo in list)
    const { watched } = this.state;
    viewableItems.filter((item) => this.state.watched.includes(item.index));
    viewableItems.forEach((item) => {
      if (!watched.includes(item.index)) {
        if ((item.index + 1) % 3 === 0) {
          this.fetchPromos(item.index + 1);
        }
        watched.push(item.index);
      }
    });
  };

  onEndReached = () => {
    if (!this.state.watchedEnd) {
      this.fetchPromos(Math.ceil(this.state.notFinished.content.length / 3) * 3);
      this.setState({ watchedEnd: true });
    }
  };

  renderPromo = (index, last) => {
    const { promos } = this.state;
    const promoIndex = last ? Math.ceil((index + 1) / 3) - 1 : (index + 1) / 3 - 1;

    const promo = promos[promoIndex];
    if (promo) {
      if (promo.fetching) {
        return <Spinner color="red" />;
      } else if (promo.image) {
        return <Promo promo={promo} navigateScreen="MarketMain" />;
      }
    } else {
      return null;
    }
  };

  renderShowMoreButton = () => {
    if (!this.state.notFinished.last) {
      if (this.state.spinningMore) {
        return <Spinner color="red" />;
      } else {
        return (
          <TouchableOpacity onPress={this.loadNextScreen} style={styles.showMoreButton}>
            <Text allowFontScaling={false} style={styles.showMoreText}>
              + {this.props.t('simple:showMore')}
            </Text>
          </TouchableOpacity>
        );
      }
    } else {
      return null;
    }
  };

  render() {
    let { activeTab, finished, notFinished } = this.state;
    const { t } = this.props;
    const { mode } = this.props.modeReducer;
    const color = getModeColor(mode);

    return (
      <Container>
        <NavigationEvents onWillFocus={() => this.refresh()} />
        <Tabs
          initialPage={this.state.activeTab}
          page={this.state.activeTab}
          onChangeTab={this.onChangeTab}
          tabBarUnderlineStyle={[{ backgroundColor: color }, styles.tabBarUnderlineStyle]}
        >
          <Tab
            heading={TabText(
              t('simple:allOrders'),
              notFinished.totalElements ? notFinished.totalElements : 0,
              activeTab,
              0,
            )}
          >
            <View style={styles.pageWrapper}>
              {this.state.spinningFirst ? (
                <Spinner color="red" />
              ) : !this.state.notFinished.empty ? (
                <Fragment>
                  <FlatList
                    refreshControl={
                      <RefreshControl
                        refreshing={this.state.refreshing}
                        onRefresh={this.refreshMethod}
                      />
                    }
                    data={this.state.notFinished.content}
                    onEndReached={this.onEndReached}
                    onEndReachedThreshold={0}
                    onViewableItemsChanged={this.onViewableItemsChanged}
                    viewabilityConfig={this.viewabilityConfig}
                    renderItem={({ item, index }) => {
                      const last = index + 1 === this.state.notFinished.content.length;
                      return (
                        <Fragment>
                          <OrderListItem order={item} navigateScreen="OrderMainMaster" />
                          {((index + 1) % 3 === 0 || last) && this.renderPromo(index, last)}
                        </Fragment>
                      );
                    }}
                    keyExtractor={(item) => `${item.id}`}
                  />
                  {this.renderShowMoreButton()}
                </Fragment>
              ) : (
                <EmptyText text={t('simple:noOrdersBySpecs')} />
              )}
            </View>
          </Tab>
          <Tab heading={TabText(t('simple:myResponds'), finished.length, activeTab, 1)}>
            <ScrollView
              refreshControl={
                <RefreshControl refreshing={this.state.refreshing} onRefresh={this.refreshMethod} />
              }
            >
              <View style={styles.pageWrapper}>
                {this.state.spinningSecond ? (
                  <Spinner color="red" />
                ) : this.state.finished && this.state.finished.length > 0 ? (
                  <FlatList
                    data={this.state.finished}
                    renderItem={({ item, index }) => (
                      <MasterRespondsListItem
                        respond={item}
                        navigateScreen="OrderMainMaster"
                        last={index + 1 === this.state.finished.length}
                      />
                    )}
                    keyExtractor={(item) => `${item.id}`}
                  />
                ) : (
                  <EmptyText text={t('order:noResponds')} />
                )}
              </View>
            </ScrollView>
          </Tab>
        </Tabs>
      </Container>
    );
  }
}

export default connect(({ authReducer, modeReducer }) => ({ authReducer, modeReducer }), {
  switchMode,
  setSpecName,
})(wrapToHoc(OrderListMaster));

const styles = StyleSheet.create({
  pageWrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
  },
  tabBarUnderlineStyle: { height: 4 },
  openDrawerButton: { paddingLeft: 10, width: 80 },
  showMoreText: {
    color: '#c20021',
    fontSize: 17,
    fontWeight: '500',
    textAlign: 'center',
  },
  showMoreButton: { alignSelf: 'center', marginVertical: 10 },
});
