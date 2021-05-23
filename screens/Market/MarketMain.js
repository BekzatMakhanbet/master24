import { AntDesign, Entypo, Feather, MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';
import { Linking } from 'expo';
import hoistStatics from 'hoist-non-react-statics';
import { Button } from 'native-base';
import React from 'react';
import { withTranslation } from 'react-i18next';
import {
  Dimensions,
  Modal,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Avatar, Image } from 'react-native-elements';
import { SliderBox } from 'react-native-image-slider-box';
import ImageView from 'react-native-image-view';
import MapView, { Marker } from 'react-native-maps';
import { WebView } from 'react-native-webview';
import { connect } from 'react-redux';
import { login } from '../../actions/authActions';
import { localizationChange } from '../../actions/localActions';
import { ProductList } from '../../components/ProductList/ProductList';
import config from '../../config/config';
import i18n from '../../i18n';
import { store } from '../../store';
import getFontSize from '../../utils/getFontSize';
import { getModeColor } from '../../utils/getModeColor';
import increaseViewCount from '../../utils/increaseViewCount';

const { height } = Dimensions.get('window');

class MarketMain extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const { state } = navigation;
    return {
      title: i18n.t('order:markets'),
      headerRight: (
        <TouchableOpacity
          onPress={state.params && state.params.onShare}
          style={{ paddingRight: 15 }}
        >
          <AntDesign size={24} name={'sharealt'} color="white" />
        </TouchableOpacity>
      ),
      headerLeft: (
        <TouchableOpacity
          onPress={() => {
            navigation.goBack(null);
          }}
          style={{ paddingLeft: 10, width: 80 }}
        >
          <AntDesign size={26} name={'arrowleft'} color="white" />
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
    const market = this.props.navigation.getParam('market');
    const marketId = props.navigation
      .dangerouslyGetParent()
      .getParam('marketId', props.navigation.getParam('marketId', 0));
    console.log('MARKET ID', marketId);

    this.state = {
      mode: '',
      refreshing: false,
      visibleImage: false,
      imageIndex: '',
      market,
      more: false,
      marketId,
      showMap: false,
      collapseMarket: false,
      collapseProduct: false,
      marketCategories: [],
      position: 0,
    };
  }

  openImage = (index) => {
    this.setState({ imageIndex: index, visibleImage: true });
  };

  pressCall = (username) => {
    const phone = `tel://+7${username}`;
    increaseViewCount('PHONE', this.state.market.id);
    axios.patch(
      `${config.url}/api/v1/market/${this.state.market.id}`,
      {
        phoneViewCount: this.state.market.phoneViewCount + 1,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
    Linking.openURL(phone);
  };

  navigatePromo = (link) => {
    if (link) {
      Linking.openURL(link);
    }
  };

  sendEmail = (email) => {
    const mailUrl = `mailto:${email}`;
    Linking.openURL(mailUrl);
  };

  onShare = async () => {
    try {
      const result = await Share.share({
        message: `http://${config.appHost}/--/MarketMainClient?marketId=${this.state.market.id}`,
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error) {}
  };

  componentDidMount() {
    if ((this.state.market === 0 || !this.state.market) && this.state.marketId !== 0) {
      this.getSingleMarket();
    }
    if (this.state.marketId === 0) {
      axios.patch(
        `${config.url}/api/v1/market/${this.state.market.id}`,
        {
          viewCount: this.state.market.viewCount + 1,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
    }

    increaseViewCount(
      'PROFILE',
      this.state.marketId === 0 ? this.state.market.id : this.state.marketId,
    );

    axios
      .get(
        `${config.url}/api/v1/product-category/market/${
          this.state.marketId === 0 ? this.state.market.id : this.state.marketId
        }`,
      )
      .then((res) => {
        const containingIds = [];
        const result = [];
        res.data.productCategories.map((cat) => {
          if (!containingIds.includes(cat.id)) {
            containingIds.push(cat.id);
            result.push(cat);
          }
        });
        this.setState({ marketCategories: result });
      })
      .catch((err) => {
        console.log(err);
      });

    const { mode } = this.props.modeReducer;

    if (mode !== this.state.mode) {
      this.props.navigation.setParams({
        color: getModeColor(mode),
        onShare: this.onShare,
      });
      this.setState({ mode });
    }
  }

  componentDidUpdate(props) {
    const { mode } = this.props.modeReducer;
    if (mode !== this.state.mode) {
      this.props.navigation.setParams({ color: getModeColor(mode) });
      this.setState({ mode });
    }
  }

  setMore = (value) => {
    this.setState({ more: value });
  };

  getSingleMarket = () => {
    axios
      .get(`${config.url}/api/v1/market/${this.state.marketId}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then((res) => {
        this.setState({ market: res.data });
        axios.patch(
          `${config.url}/api/v1/market/${this.state.marketId}`,
          {
            viewCount: this.state.market.viewCount + 1,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        );
      })
      .catch((err) => {
        console.log(err);
      });
  };

  render() {
    const { t } = this.props;
    const { market } = this.state;
    const { mode } = this.props.modeReducer;

    const slider_images = [];
    const images = [];

    if (market && market !== 0) {
      market.photos &&
        market.photos.forEach((element) => {
          // slider_images.push({ url: `${config.url}/images/${element.imageName}` });
          slider_images.push(`${config.url}/images/${element.imageName}`);
          images.push({
            source: { uri: `${config.url}/images/${element.imageName}` },
          });
        });
    }

    return market ? (
      <ScrollView style={styles.masterRoot}>
        <View
          style={{
            flexDirection: 'row',
            width: '90%',
            alignSelf: 'center',
            alignItems: 'center',
            justifyContent: 'space-around',
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginVertical: 10,
            }}
          >
            <View style={{ marginRight: 10 }}>
              <Avatar
                rounded
                size="medium"
                icon={{ name: 'user', type: 'font-awesome' }}
                source={{
                  uri: market.logo && `${config.url}/images/${market.logo.imageName}`,
                }}
                activeOpacity={0.7}
              />
            </View>
            <View style={{ width: '65%' }}>
              <Text
                allowFontScaling={false}
                style={{ fontWeight: '500', fontSize: getFontSize(20) }}
              >
                {market.marketName}
              </Text>
              <Text allowFontScaling={false} style={{ color: '#b2bdbf', fontWeight: '400' }}>
                {market.industry}
              </Text>
            </View>
          </View>
          <View
            style={{
              width: '24%',
              flexDirection: 'row',
              justifyContent: 'space-around',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <AntDesign name="eye" size={getFontSize(18)} color="#c1c3c7" />
              <Text allowFontScaling={false} style={styles.bottomGreyTexts}>
                {' '}
                {market.viewCount}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialIcons name="call" size={getFontSize(18)} color="#c1c3c7" />
              <Text allowFontScaling={false} style={styles.bottomGreyTexts}>
                {' '}
                {market.phoneViewCount}
              </Text>
            </View>
          </View>
        </View>
        <View
          style={{
            width: '100%',
            alignSelf: 'center',
            paddingVertical: 5,
          }}
        >
          {/* <Slideshow
            height={250}
            dataSource={slider_images}
            position={this.state.position}
            onPositionChanged={position => this.setState({ position })}
          /> */}
          <SliderBox images={slider_images} sliderBoxHeight={250} />
        </View>
        <View
          style={{
            width: '90%',
            alignSelf: 'center',
            paddingHorizontal: 5,
            borderBottomWidth: 2,
            borderBottomColor: '#cadadd',
          }}
        >
          <View>
            <Text allowFontScaling={false} style={styles.labelInfo}>
              {t('simple:aboutOrg')}
            </Text>
            <Text allowFontScaling={false} style={[styles.textInfo, { marginBottom: 0 }]}>
              {this.state.more ? market.about : market.about.substring(0, 100)}
            </Text>
            <TouchableOpacity
              style={{ marginBottom: 7 }}
              onPress={() => this.setMore(!this.state.more)}
            >
              <Text allowFontScaling={false} style={styles.buttonText}>
                {this.state.more ? t('simple:hide') : t('simple:readAll')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <View
          style={{
            width: '90%',
            paddingBottom: 5,
            paddingHorizontal: 5,
            alignSelf: 'center',
            borderBottomWidth: 2,
            borderBottomColor: '#cadadd',
          }}
        >
          <View>
            <Text allowFontScaling={false} style={styles.labelInfo}>
              {t('simple:workSchedule')}
            </Text>
            <View style={{ flexDirection: 'row' }}>
              <View style={{ marginRight: 10, flexDirection: 'row' }}>
                <View style={{}}>
                  <Text allowFontScaling={false} style={{ fontSize: getFontSize(15) }}>
                    {t('simple:mnfr')}:{' '}
                  </Text>
                  <Text allowFontScaling={false} style={{ fontSize: getFontSize(15) }}>
                    {t('simple:saturday')}:{' '}
                  </Text>
                </View>
                <View style={{}}>
                  <Text
                    allowFontScaling={false}
                    style={{ fontWeight: '500', fontSize: getFontSize(15) }}
                  >
                    {market.workdaysSchedule}
                  </Text>
                  <Text
                    allowFontScaling={false}
                    style={{ fontWeight: '500', fontSize: getFontSize(15) }}
                  >
                    {market.saturdaySchedule}
                  </Text>
                </View>
              </View>
              <View>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}
                >
                  <Text
                    allowFontScaling={false}
                    style={{
                      fontSize: getFontSize(15),
                    }}
                  >
                    {t('simple:break')}:{' '}
                  </Text>
                  <Text
                    allowFontScaling={false}
                    style={{ fontWeight: '500', fontSize: getFontSize(15) }}
                  >
                    {market.breakSchedule}
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}
                >
                  <Text allowFontScaling={false} style={{ fontSize: getFontSize(15) }}>
                    {t('simple:sunday')}:{' '}
                  </Text>
                  <Text
                    allowFontScaling={false}
                    style={{ fontWeight: '500', fontSize: getFontSize(15) }}
                  >
                    {market.sundaySchedule}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
        <View
          style={{
            width: '90%',
            paddingBottom: 5,
            paddingHorizontal: 5,
            alignSelf: 'center',
            borderBottomWidth: 2,
            borderBottomColor: '#cadadd',
          }}
        >
          <View style={{ borderBottomWidth: 2, borderBottomColor: '#cadadd' }}>
            <Text allowFontScaling={false} style={styles.labelInfo}>
              {t('simple:promos')}
            </Text>
            <View
              style={[
                {
                  width: '100%',
                  paddingVertical: 10,
                  alignItems: 'center',
                  alignSelf: 'center',
                },
              ]}
            >
              {market.promos.length > 0 ? (
                market.promos.map(
                  (promo, index) =>
                    (index < 1 || this.state.collapseMarket) && (
                      <TouchableOpacity
                        key={`${index}`}
                        style={{
                          width: '100%',
                          alignSelf: 'center',
                        }}
                        onPress={() => this.navigatePromo(promo.link)}
                      >
                        <Image
                          style={styles.image}
                          resizeMode="contain"
                          source={{
                            uri: promo.image
                              ? `${config.url}/images/${promo.image.imageName}`
                              : config.defaultImage,
                          }}
                        />
                      </TouchableOpacity>
                    ),
                )
              ) : (
                <View style={{ marginVertical: 15 }}>
                  <Text
                    allowFontScaling={false}
                    style={{
                      textAlign: 'center',
                      color: '#b2bdbf',
                      fontSize: getFontSize(16),
                      fontWeight: '500',
                    }}
                  >
                    {t('simple:noPromos')}
                  </Text>
                </View>
              )}
            </View>
            {market.promos.length > 1 && (
              <TouchableOpacity
                onPress={() =>
                  this.setState({
                    collapseMarket: !this.state.collapseMarket,
                  })
                }
                style={{ alignSelf: 'center', marginBottom: 10 }}
              >
                <Text
                  allowFontScaling={false}
                  style={{
                    color: '#c20021',
                    fontSize: getFontSize(17),
                    fontWeight: '500',
                    textAlign: 'center',
                  }}
                >
                  {this.state.collapseMarket ? t('simple:hide') : `+ ${t('simple:showMore')}`}
                </Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={{ borderBottomWidth: 2, borderBottomColor: '#cadadd' }}>
            <Text allowFontScaling={false} style={styles.labelInfo}>
              {t('simple:productsAndPrices')}
            </Text>
            <View
              style={{
                flexWrap: 'wrap',
                flexDirection: 'row',
                justifyContent: 'center',
                width: '100%',
                paddingVertical: 10,
              }}
            >
              {this.state.marketCategories.length > 0 ? (
                this.state.marketCategories.map(
                  (cat, index) =>
                    (index < 3 || this.state.collapseProduct) && (
                      <ProductList
                        key={index}
                        category={cat}
                        marketPhone={market.phone}
                        marketId={market.id}
                        pressCall={this.pressCall}
                      />
                    ),
                )
              ) : (
                <View style={{ marginVertical: 15 }}>
                  <Text
                    allowFontScaling={false}
                    style={{
                      textAlign: 'center',
                      color: '#b2bdbf',
                      fontSize: 16,
                      fontWeight: '500',
                    }}
                  >
                    {t('simple:noInfo')}
                  </Text>
                </View>
              )}
            </View>
            {this.state.marketCategories.length > 3 && (
              <TouchableOpacity
                onPress={() =>
                  this.setState({
                    collapseProduct: !this.state.collapseProduct,
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
                  {this.state.collapseProduct ? 'Скрыть' : '+ См. еще'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
          <View
            style={{
              width: '100%',
              paddingBottom: 5,
              paddingHorizontal: 5,
              alignSelf: 'center',
            }}
          >
            <View>
              <Text allowFontScaling={false} style={styles.labelInfo}>
                Видео
              </Text>
              {market.youtubeVideoLink ? (
                <WebView
                  source={{
                    uri: `https://www.youtube.com/embed/${market.youtubeVideoLink.substring(
                      market.youtubeVideoLink.lastIndexOf('/') + 1,
                      market.youtubeVideoLink.length,
                    )}`,
                  }}
                  useWebKit={true}
                  style={{
                    marginTop: 20,
                    width: '100%',
                    height: 220,
                    alignSelf: 'center',
                  }}
                />
              ) : (
                <View style={{ marginVertical: 15 }}>
                  <Text
                    allowFontScaling={false}
                    style={{
                      textAlign: 'center',
                      color: '#b2bdbf',
                      fontSize: 16,
                      fontWeight: '500',
                    }}
                  >
                    {t('simple:noVideo')}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
        <View
          style={{
            width: '90%',
            paddingBottom: 5,
            paddingHorizontal: 5,
            alignSelf: 'center',
          }}
        >
          <View
            style={{
              width: '98%',
              paddingTop: 10,
              paddingBotttom: 5,
              paddingHorizontal: 5,
              alignSelf: 'center',
            }}
          >
            <View style={{ flexDirection: 'row' }}>
              <View style={styles.iconContainer}>
                <Entypo color="white" name="location-pin" size={18} />
              </View>
              <Text allowFontScaling={false} style={{ fontSize: getFontSize(16), marginRight: 15 }}>
                {market.address}
              </Text>
            </View>
          </View>
        </View>
        {market.coordinates && market.coordinates.toLowerCase().indexOf('latitude') > 0 && (
          <MapView
            onPress={() => {
              console.log('HEllo');

              this.setState({ showMap: true });
            }}
            style={{
              width: '85%',
              alignSelf: 'center',
              height: 200,
              marginBottom: 7,
            }}
            initialRegion={{
              latitude: market.coordinates
                ? parseFloat(JSON.parse(market.coordinates.toLowerCase()).latitude)
                : 43.238949,
              longitude: market.coordinates
                ? parseFloat(JSON.parse(market.coordinates.toLowerCase()).longitude)
                : 76.889709,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
            pitchEnabled={false}
            rotateEnabled={false}
            zoomEnabled={false}
            scrollEnabled={false}
          >
            <Marker
              coordinate={{
                latitude: parseFloat(JSON.parse(market.coordinates.toLowerCase()).latitude),
                longitude: parseFloat(JSON.parse(market.coordinates.toLowerCase()).longitude),
              }}
            />
          </MapView>
        )}
        <View
          style={{
            width: '90%',
            paddingBottom: 5,
            paddingHorizontal: 5,
            alignSelf: 'center',
          }}
        >
          <View
            style={{
              width: '98%',
              paddingVertical: 10,
              paddingHorizontal: 5,
              alignSelf: 'center',
              borderTopWidth: 2,
              borderTopColor: '#cadadd',
              borderBottomWidth: 2,
              borderBottomColor: '#cadadd',
            }}
          >
            <View style={{ flexDirection: 'row' }}>
              <View style={styles.iconContainer}>
                <Entypo color="white" name="email" size={16} />
              </View>
              <Text allowFontScaling={false} style={{ fontSize: getFontSize(16), marginRight: 15 }}>
                {market.email}
              </Text>
              <TouchableOpacity onPress={() => this.sendEmail(market.email)}>
                <Text allowFontScaling={false} style={styles.buttonText}>
                  {t('simple:write')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View
            style={{
              width: '98%',
              paddingVertical: 10,
              paddingHorizontal: 5,
              alignSelf: 'center',
              borderBottomWidth: 2,
              borderBottomColor: '#cadadd',
            }}
          >
            <View style={{ flexDirection: 'row' }}>
              <View style={styles.iconContainer}>
                <Feather color="white" name="globe" size={18} />
              </View>
              <Text
                allowFontScaling={false}
                onPress={() => Linking.openURL(`${market.site}`)}
                style={{
                  fontSize: getFontSize(16),
                  marginRight: 15,
                  textDecorationLine: 'underline',
                  color: '#c20021',
                }}
              >
                {market.site}
              </Text>
            </View>
          </View>

          <View
            style={{
              width: '98%',
              paddingBottom: 5,
              paddingHorizontal: 5,
              alignSelf: 'center',
              // borderBottomWidth: 2,
              // borderBottomColor: "#cadadd"
            }}
          >
            <Button
              onPress={() => this.pressCall(market.phone)}
              style={{
                alignSelf: 'center',
                width: '100%',
                borderRadius: 5,
                paddingVertical: 5,
                paddingHorizontal: 15,
                marginTop: 10,
                backgroundColor: getModeColor(mode),
              }}
              block
            >
              <View style={{ flexDirection: 'row', width: '100%' }}>
                <View style={{}} />
                <Feather name="phone-call" size={24} color="white" />
                <Text
                  allowFontScaling={false}
                  style={{
                    position: 'absolute',
                    left: '38%',
                    color: 'white',
                    fontSize: getFontSize(17),
                    fontWeight: '500',
                  }}
                >
                  {t('simple:call')}
                </Text>
              </View>
            </Button>
          </View>
        </View>
        <ImageView
          glideAlways
          images={images}
          imageIndex={this.state.imageIndex}
          animationType="fade"
          isVisible={this.state.visibleImage}
          onClose={() => this.setState({ visibleImage: false })}
        />
        <Modal animationType="fade" transparent={false} visible={this.state.showMap}>
          <View style={{ height }}>
            {market.coordinates && market.coordinates.toLowerCase().indexOf('latitude') > 0 && (
              <MapView
                style={{
                  alignSelf: 'stretch',
                  height: height - 70,
                }}
                region={{
                  latitude: market.coordinates
                    ? parseFloat(JSON.parse(market.coordinates.toLowerCase()).latitude)
                    : 43.238949,
                  longitude: market.coordinates
                    ? parseFloat(JSON.parse(market.coordinates.toLowerCase()).longitude)
                    : 76.889709,
                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.0421,
                }}
              >
                <Marker
                  coordinate={{
                    latitude: parseFloat(JSON.parse(market.coordinates.toLowerCase()).latitude),
                    longitude: parseFloat(JSON.parse(market.coordinates.toLowerCase()).longitude),
                  }}
                />
              </MapView>
            )}

            <Button light onPress={() => this.setState({ showMap: false })}>
              <Text
                allowFontScaling={false}
                style={{
                  width: '100%',
                  color: '#c20021',
                  textAlign: 'center',
                  fontSize: getFontSize(16),
                  fontWeight: '500',
                }}
              >
                {t('simple:close')}
              </Text>
            </Button>
          </View>
        </Modal>
      </ScrollView>
    ) : (
      <View />
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flex: 1,
  },
  input: {
    paddingLeft: 10,
    color: 'black',
    marginTop: 10,
  },
  exitButton: {
    alignSelf: 'center',
    marginBottom: 50,
    flexDirection: 'row',
  },
  exitText: {
    color: '#c20021',
    fontSize: getFontSize(18),
    fontWeight: '400',
  },
  inputContainer: {
    borderBottomWidth: 1,
    alignSelf: 'center',
    width: '90%',
    borderBottomColor: '#8b998f',
    marginVertical: 3,
  },
  icons: {
    width: '17%',
    textAlign: 'right',
  },
  image: {
    width: '100%',
    height: 220,
    marginVertical: 10,
  },
  iconText: {
    color: '#b2bdbf',
    fontSize: 16,
    marginLeft: 5,
  },
  masterRoot: {
    flex: 1,
    width: '100%',
  },
  name: {
    fontWeight: '500',
    fontSize: 20,
    color: 'black',
    textAlign: 'center',
  },
  info: {
    fontWeight: '400',
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
  },
  labelInfo: {
    textAlign: 'left',
    fontSize: 18,
    fontWeight: '500',
    marginTop: 7,
    marginBottom: 4,
  },
  textInfo: {
    color: 'black',
    fontWeight: '400',
    textAlign: 'left',
    flexShrink: 1,
    marginVertical: 7,
    fontSize: 15,
  },
  bottomGreyTexts: {
    fontSize: getFontSize(13),
    color: '#c1c3c7',
    lineHeight: 16,
  },
  specilization: {
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 19,
  },
  buttonText: {
    color: '#c20021',
    textDecorationLine: 'underline',
    fontSize: getFontSize(16),
  },
  iconContainer: {
    width: 22,
    height: 22,
    borderRadius: 50,
    marginRight: 15,
    backgroundColor: '#c20021',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default connect(
  ({ modeReducer, localReducer, authReducer }) => ({
    modeReducer,
    localReducer,
    authReducer,
  }),
  { localizationChange, login },
)(hoistStatics(withTranslation()(MarketMain), MarketMain));
