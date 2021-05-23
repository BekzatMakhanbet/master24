import { AntDesign, MaterialCommunityIcons, Octicons } from '@expo/vector-icons';
import axios from 'axios';
import hoistStatics from 'hoist-non-react-statics';
import { Badge, Spinner, Text as NativeText } from 'native-base';
import React, { Fragment } from 'react';
import { withTranslation } from 'react-i18next';
import {
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NavigationEvents } from 'react-navigation';
import { Avatar } from 'react-native-elements';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { connect } from 'react-redux';
import { switchMode } from '../../actions/modeActions';
import EmptyText from '../../components/EmptyText';
import Promo from '../../components/Promo';
import config from '../../config/config';
import i18n from '../../i18n';
import { store } from '../../store';
import getLastOnline from '../../utils/getLastOnline';
import { getModeColor } from '../../utils/getModeColor';
import getUserDuration from '../../utils/getUserDuration';
import getUserRating from '../../utils/getUserRating';

class AllMasterScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const { state } = navigation;
    return {
      title: i18n.t('menu:allMasters'),
      headerRight: (
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('FilterMasters', {
              filters: state.params ? state.params.filters : [],
            })
          }
          style={{ paddingRight: 10, flexDirection: 'row' }}
        >
          {state.params && state.params.filter && state.params.filter.length > 0 && (
            <Badge warning>
              <NativeText style={{ color: '#fff', padding: 0, margin: 0 }}>
                {state.params.filter.length}
              </NativeText>
            </Badge>
          )}
          <MaterialCommunityIcons size={26} name={'filter-outline'} color="white" />
        </TouchableOpacity>
      ),
      headerLeft: (
        <TouchableOpacity onPress={navigation.openDrawer} style={{ paddingLeft: 10 }}>
          <Octicons size={26} name={'three-bars'} color="white" />
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
    this.state = {
      refreshing: false,
      spinning: false,
      mode: '',
      users: [],
      filter: [],
      promos: [],
      filteredValue: [],
      watched: [],
      endReached: false,
    };
  }

  componentDidMount() {
    console.log('RENDERED THE ALL MASTER SCREEN');

    this.refresh();
    this.setState({ spinning: true });
    const { mode } = this.props.modeReducer;
    if (mode != this.state.mode) {
      this.props.navigation.setParams({
        color: getModeColor(mode),
        filters: this.state.filter,
      });
      this.setState({ mode });
    }
  }

  refresh = () => {
    this.setState({ spinning: true, watched: [], promos: [], endReached: false });
    const { city } = this.props.authReducer;

    axios.get(`${config.url}/api/v1/user/masters`).then((res) => {
      let { users } = res.data;
      users = users.filter((user) => user.city.id === city.id);
      this.setState({ users, filteredValue: users, spinning: false });
      if (this.state.filter.length > 0) {
        const masters = this.state.users.filter((item) => {
          let has = false;
          item.specializations.map(({ id }) => {
            if (this.state.filter.includes(id)) {
              has = true;
            }
          });
          if (has) {
            return item;
          }
        });
        this.setState({ filteredValue: masters });
      }
    });
  };

  componentDidUpdate(props) {
    const { mode } = this.props.modeReducer;
    if (mode != this.state.mode) {
      this.props.navigation.setParams({
        color: getModeColor(mode),
        filters: this.state.filter,
      });
      this.setState({ mode });
    }
  }

  onViewableItemsChanged = ({ viewableItems }) => {
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
    console.log('END Reached ggg HELLLO');
    if (!this.state.endReached) {
      this.setState({ endReached: true });
      this.fetchPromos(Math.ceil(this.state.filteredValue.length / 3) * 3);
    }
  };

  fetchPromos = (index) => {
    const promoIndex = index / 3 - 1;
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
    const { navigate } = this.props.navigation;
    const { t } = this.props;
    const filter = this.props.navigation.getParam('filter', []);
    if (filter.length === 0 && this.state.filter.length !== 0) {
      this.setState({ filter: [] });
      this.refresh();
    }

    if (filter.length > 0 && filter !== this.state.filter) {
      this.setState({ filter });

      const masters = this.state.users.filter((item) => {
        let has = false;
        item.specializations.map(({ id }) => {
          if (filter.includes(id)) {
            has = true;
          }
        });
        if (has) {
          return item;
        }
      });

      this.setState({ filteredValue: masters });
    }
    return (
      <View style={{ flex: 1 }}>
        <NavigationEvents onWillFocus={() => this.refresh()} />

        {this.state.spinning ? (
          <Spinner color="red" />
        ) : this.state.filteredValue.length > 0 ? (
          <FlatList
            data={this.state.filteredValue}
            onEndReached={this.onEndReached}
            onEndReachedThreshold={0.3}
            onViewableItemsChanged={this.onViewableItemsChanged}
            viewabilityConfig={{ viewAreaCoveragePercentThreshold: 10 }}
            refreshControl={
              <RefreshControl
                //refresh control used for the Pull to Refresh
                refreshing={this.state.refreshing}
                onRefresh={this.refresh}
              />
            }
            renderItem={({ item, index }) => (
              <FlatListItem
                item={item}
                navigate={navigate}
                index={index}
                last={index + 1 === this.state.filteredValue.length}
                t={this.props.t}
                promos={this.state.promos}
                navigation={this.props.navigation}
              />
            )}
            keyExtractor={(item) => item.id + ''}
          />
        ) : (
          <EmptyText text={t('simple:noMastersAtThisMoment2')} />
        )}
      </View>
    );
  }
}

class FlatListItem extends React.Component {
  renderPromo = () => {
    const { promos, last, index } = this.props;
    const promoIndex = last ? Math.ceil((index + 1) / 3) - 1 : (index + 1) / 3 - 1;
    console.log('RenderPromo');

    const promo = promos[promoIndex];
    if (promo) {
      if (promo.fetching) {
        return <Spinner color="red" />;
      } else if (promo.image) {
        return <Promo promo={promo} navigateScreen="MarketMainProfileClientAll" />;
      }
    } else {
      return null;
    }
  };

  render() {
    const { item, t, index, last } = this.props;
    const onlineStatus = getLastOnline(item.lastRequest);

    return (
      item.status !== 'BLOCKED' && (
        <Fragment>
          <TouchableWithoutFeedback
            onPress={() => {
              this.props.navigate('MasterProfileForClient', {
                user: item,
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
                      {item.created && getUserDuration(item.created)}
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
          {((index + 1) % 3 === 0 || last) && this.renderPromo()}
        </Fragment>
      )
    );
  }
}
export default connect(({ authReducer, modeReducer }) => ({ authReducer, modeReducer }), {
  switchMode,
})(hoistStatics(withTranslation()(AllMasterScreen), AllMasterScreen));

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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexDirection: 'row',
    marginVertical: 5,
    paddingHorizontal: 10,
    paddingBottom: 10,
    marginLeft: '2.5%',
    paddingTop: 10,
    borderWidth: 2.5,
    borderColor: '#c20021',
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  bottomGreyTexts: {
    fontSize: 13,
    color: '#999999',
    lineHeight: 16,
  },
});
