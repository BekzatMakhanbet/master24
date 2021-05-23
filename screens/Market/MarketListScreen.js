import { AntDesign, MaterialCommunityIcons, MaterialIcons, Octicons } from '@expo/vector-icons';
import axios from 'axios';
import { Badge, Spinner, Text as NativeText } from 'native-base';
import React from 'react';
import {
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image } from 'react-native-elements';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { connect } from 'react-redux';
import { setMarketCount } from '../../actions/mastersOrderSpecAction';
import { switchMode } from '../../actions/modeActions';
import wrapToHoc from '../../hoc/wrapToHoc';
import i18n from '../../i18n';
import { store } from '../../store';
import getFontSize from '../../utils/getFontSize';
import { getModeColor } from '../../utils/getModeColor';
import getNamesLocal from '../../utils/getNamesLocal';
import config from '../../config/config';

class MarketListScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const { state } = navigation;
    return {
      title: i18n.t('order:allMarkets'),
      headerRight: (
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('MarketFilter', {
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
          <MaterialCommunityIcons size={getFontSize(26)} name={'filter-outline'} color="white" />
        </TouchableOpacity>
      ),
      headerLeft: (
        <TouchableOpacity onPress={navigation.openDrawer} style={{ paddingLeft: 10, width: 80 }}>
          <Octicons size={getFontSize(26)} name={'three-bars'} color="white" />
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
    const { specialization } = props.navigation.dangerouslyGetParent().getParam('item', 0);
    this.state = {
      refreshing: false,
      spinning: false,
      mode: '',
      filter: [],
      markets: [],
      filteredValue: [],
      specialization,
    };
  }

  componentDidMount() {
    this.refresh();
    this.setState({ spinning: true });
    const { mode } = this.props.modeReducer;
    if (mode !== this.state.mode) {
      this.props.navigation.setParams({
        color: getModeColor(mode),
        filters: this.state.filter,
      });
      this.setState({ mode });
    }
  }

  refresh = () => {
    const { specializations, city } = this.props.authReducer;

    this.setState({ spinning: true });

    let specs = '';
    if (specializations) {
      for (let i = 0; i < specializations.length; i++) {
        specs += `specs=${specializations[i].id}&`;
      }
      specs = specs.substring(0, specs.lastIndexOf('&'));
    }

    axios
      .get(`${config.url}/api/v1/market/specialization?${specs}&cityId=${city.id}`)
      .then((res) => {
        this.setState({ spinning: false });
        this.setState({
          markets: res.data.markets,
          filteredValue: res.data.markets,
        });
        console.log(res.data.markets.length);

        this.props.setMarketCount(res.data.markets.length);

        if (this.state.filter.length > 0 && this.state.markets) {
          const masters = this.state.markets.filter((market) => {
            if (this.state.filter.includes(market.industry)) {
              return market;
            }
          });
          this.setState({ filteredValue: masters });
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
      this.props.navigation.setParams({
        color: getModeColor(mode),
        filters: this.state.filter,
      });
      this.setState({ mode });
    }
  }

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
      const masters = this.state.markets.filter((item) => {
        if (this.state.filter.includes(item.industry)) {
          return item;
        }
      });

      this.setState({ filteredValue: masters }, () => {
        this.refresh();
      });
    }

    return (
      <View>
        <ScrollView
          refreshControl={
            <RefreshControl
              //refresh control used for the Pull to Refresh
              refreshing={this.state.spinning}
              onRefresh={this.refresh}
            />
          }
        >
          <View style={{ width: '100%', justifyContent: 'center', paddingTop: 10 }}>
            {this.state.spinning ? (
              <Spinner color="red" />
            ) : this.state.filteredValue.length > 0 ? (
              <FlatList
                data={this.state.filteredValue}
                renderItem={({ item, index }) => {
                  return <FlatListItem item={item} navigate={navigate} index={index} />;
                }}
                keyExtractor={(item, index) => index + ''}
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
                  adjustsFontSizeToFit={true}
                  style={{
                    textAlign: 'center',
                    fontSize: getFontSize(16),
                    fontWeight: '500',
                    marginVertical: 20,
                    color: '#999999',
                  }}
                >
                  {t('simple:noMarkets')}
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    );
  }
}

export class FlatListItem extends React.Component {
  render() {
    const { item } = this.props;
    return (
      <TouchableWithoutFeedback
        onPress={() => {
          this.props.navigate('MarketMain', { market: item });
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
                <Image
                  source={{
                    uri:
                      item.photos && item.photos.length > 0
                        ? `${config.url}/images/${item.photos[0].imageName}`
                        : 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAACoCAMAAABt9SM9AAAAElBMVEXy8vL////6+vr19fX4+Pj8/Px/aeudAAACoklEQVR4nO3c227bMBBF0cgk//+XGwu6kRxeRnFaVGevt8a2AG3QQ0kN8vUFAAAAAAAAAAAAAAAAAAAAAACAv2j5Ba9/fVK/hVgOxHL4Prf0+qD08FgfPbfw8Fjpk8cjlgOxHIjlQCwHYjlIxgoh3DqeXqyQbl+Ky8VK551L9B5PLFb40X2eWKyf3RVrxUpFrMU36KVihbKV88pCKtarfjzlWlpSsepWvh1RPZbr3JVi1SPLObSUYlkri1g7ZpZDGau6zGI3PJWxjKHV+3gqv6NSsXxX8KkqoxWrXFq98R7rkaYVq6jVaxWMpScWK6vVPW9rqKnF2r5e71e6G6G5+vRifZ9zjHFwyZDM9acYayx7PHEOeWIZ4pI5ViGxatW16/UFYlUfsy/HiFUx7iC3oxCrZDx73oc8sQrRarUNeWLlrKepx5AnVqbZaq0lHytmd3/tVu8jqccK2VuMjfA65NVjLdf3mBvhKYjHStuaWTU2wkst6Vj71+64MBiTjXV+7cL2dmK1XJdS+W9i5bI2qfoJsYpXy1rDEa8aq7ymitYPibWqr6nWIT+spRjL+sJNbYmCsexR3n5FOpYdYmZL1IvVmkxrif6WKBerPcXHW6JarN7SGW6JYrH6Q2m0JYrF6rYabolasQatRluiVKzJG5rmXFOKNXhyvOpuiUKxJh4rLP0tUSfW3JPj7ddm1GNNtuptiTKxxsN9194SVWLNDPesifUBkVhzw33X2hI1Ys0O911jS9SI5WzVukuUiDU/3A/vj1XrUSHWjVb2/44JxPJshEWYl/GzJzpieYf7ztgSHx/rbitrS3x8rDsDa7MeJ+0UYn2K9i+zOT09Fn8ueNbCH6Ked3+utxGLWMQCAAAAAAAAAAAAAAAAAAAAAAD4//0BUyATTom0AxcAAAAASUVORK5CYII=',
                  }}
                  style={{
                    width: getFontSize(130),
                    height: getFontSize(100),
                    marginRight: 5,
                  }}
                />
              </View>
            </View>
            <View style={styles.orderText}>
              <Text
                allowFontScaling={false}
                adjustsFontSizeToFit={true}
                style={{
                  color: 'black',
                  fontWeight: '600',
                  fontSize: getFontSize(18),
                }}
              >
                {item.marketName}
              </Text>
              <View>
                <Text
                  allowFontScaling={false}
                  adjustsFontSizeToFit={true}
                  style={styles.bottomGreyTexts2}
                >
                  {item.industry}
                </Text>
                <Text
                  allowFontScaling={false}
                  adjustsFontSizeToFit={true}
                  style={styles.bottomGreyTexts2}
                >
                  {item.city && getNamesLocal(item.city.cityName, item.city.cityNameKz)},{' '}
                  {item.address}
                </Text>
              </View>
              <View
                style={{
                  width: '70%',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginVertical: 5,
                }}
              >
                <View
                  style={{
                    flex: 3,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <AntDesign name="eye" size={getFontSize(20)} color="#c1c3c7" />
                  <Text
                    allowFontScaling={false}
                    adjustsFontSizeToFit={true}
                    style={styles.bottomGreyTexts}
                  >
                    {' '}
                    {item.viewCount}
                  </Text>
                </View>
                <View
                  style={{
                    flex: 3,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <MaterialIcons name="call" size={getFontSize(20)} color="#c1c3c7" />
                  <Text
                    allowFontScaling={false}
                    adjustsFontSizeToFit={true}
                    style={styles.bottomGreyTexts}
                  >
                    {' '}
                    {item.phoneViewCount}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    );
  }
}

export default connect(
  ({ authReducer, modeReducer, mastersOrderSpec }) => ({
    authReducer,
    modeReducer,
    mastersOrderSpec,
  }),
  { switchMode, setMarketCount },
)(wrapToHoc(MarketListScreen));

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
    fontSize: getFontSize(14),
    lineHeight: 19,
  },
  orderText: {
    width: '63%',
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
    fontSize: getFontSize(14),
    color: '#c1c3c7',
    lineHeight: 16,
    fontWeight: '500',
  },
  bottomGreyTexts2: {
    fontSize: getFontSize(14),
    color: '#999999',
    lineHeight: 17,
    fontWeight: '400',
  },
});
