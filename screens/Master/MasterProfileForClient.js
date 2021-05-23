/* eslint-disable no-alert */
import { AntDesign, Entypo, Feather } from '@expo/vector-icons';
import axios from 'axios';
import { Linking } from 'expo';
import hoistStatics from 'hoist-non-react-statics';
import { Badge, Button, Content, Segment } from 'native-base';
import React from 'react';
import { withTranslation } from 'react-i18next';
import {
  Dimensions,
  Modal,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Avatar, Image } from 'react-native-elements';
import { FlatList } from 'react-native-gesture-handler';
import ImageView from 'react-native-image-view';
import { WebView } from 'react-native-webview';
import { connect } from 'react-redux';
import { login } from '../../actions/authActions';
import { localizationChange } from '../../actions/localActions';
import Comment from '../../components/Comment/Comment';
import Guides from '../../components/Guides/Guides';
import stylesObject from '../../constants/style/stylesObject';
import { store } from '../../store';
import getAge from '../../utils/getAge';
import getFontSize from '../../utils/getFontSize';
import getLastOnline from '../../utils/getLastOnline';
import { getModeColor } from '../../utils/getModeColor';
import getNamesLocal from '../../utils/getNamesLocal';
import getUserRating from '../../utils/getUserRating';
import increaseViewCount from '../../utils/increaseViewCount';
import sendPushNotification from '../../utils/sendPushNotification';
import config from '../../config/config';

const { width } = Dimensions.get('window');

class MasterProfileForClient extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const { state } = navigation;
    return {
      title: 'Мастер',
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
      headerRight: (
        <View style={stylesObject.defaultFlexRow}>
          <TouchableOpacity onPress={state.params.onShare} style={{ paddingRight: 15 }}>
            <AntDesign size={24} name={'sharealt'} color="white" />
          </TouchableOpacity>
          <Guides screenName="Master" />
        </View>
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
    const user = props.navigation.getParam('user', 0);
    const username = props.navigation.getParam('username', 0);
    const hasOrder = props.navigation.getParam('hasOrder', true);
    console.log(username);

    this.state = {
      mode: '',
      refreshing: false,
      visibleImage: false,
      visibleAvatar: false,
      imageIndex: 0,
      user,
      username,
      activePage: 1,
      hasOrder,
      visibleCreateOrderModal: false,
      modalCallVisible: false,
      promo: null,
      order: null,
      gg: false,
      collapseReviews: false,
    };
  }

  openImageView = (index) => {
    this.setState({ imageIndex: index, visibleImage: true });
  };

  onShare = async () => {
    try {
      const result = await Share.share({
        message: `http://${config.appHost}/--/MasterProfileForClient?hasOrder=${false}&username=${
          this.state.user.username
        }`,
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
    } catch (error) {
      alert(error.message);
    }
  };

  getSingleMaster = () => {
    axios.get(`${config.url}/api/v1/user/${this.state.username}`).then((res) => {
      this.setState({ user: res.data });
      const options = {
        method: 'PATCH',
        url: `${config.url}/api/v1/user/view-count/${res.data.id}`,
      };
      axios(options);
    });
  };

  componentDidMount() {
    console.log('SPEC');

    const { mode } = this.props.modeReducer;
    if (this.state.user === 0 && this.state.username !== 0) {
      this.getSingleMaster();
    }

    axios
      .get(
        `http://91.201.215.45:49153/api/v1/promo/order?count=1&city=${this.props.authReducer.city.id}`,
      )
      .then((res) => this.setState({ promo: res.data[0] }));

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

  _pressCall = () => {
    const phone = `tel://+7${this.state.user.username}`;
    Linking.openURL(phone);
    axios
      .get(
        `${
          config.url
        }/api/v1/order?direction=desc&mode=SINGLE&order=${this.props.navigation
          .dangerouslyGetParent()
          .getParam('itemId', this.props.navigation.getParam('orderId', 0))}&orderBy=id`,
      )
      .then((res) => {
        if (!res.data.content[0].master) {
          this.setState({ order: res.data.content[0] });
          setTimeout(() => this.setState({ modalCallVisible: true }), 1000);
        }
      });
  };

  sendToMaster = () => {
    // Send Notification to Master about Order when Customer presses that they agreed with Master
    this.setState({ modalCallVisible: false });
    const { order } = this.state;

    sendPushNotification(
      `Если так примите заказ №${order.id} «${order.description.substring(0, 20)}${
        order.description.length > 20 ? '...' : ''
      }»`,
      `Олай болса тапсырысты қабылдаңыз №${order.id} «${order.description.substring(0, 20)}${
        order.description.length > 20 ? '...' : ''
      }»`,
      'Заказчик договорился с Вами ?',
      'Тапсырыс беруші Сізбен келісім жасады ма?',
      this.state.user.id,
      'MyOrderMaster',
      order.id,
      'master',
      'question',
      true,
      false,
    );
  };

  navigateToCreateOrder = () => {
    this.setState({ visibleCreateOrderModal: false });
    this.props.navigation.dispatch(
      this.props.authReducer.loggedIn
        ? {
            type: 'Navigation/NAVIGATE',
            routeName: 'CreateOrder',
            action: {
              type: 'Navigation/NAVIGATE',
              routeName: 'NewsStack',
            },
          }
        : {
            type: 'Navigation/NAVIGATE',
            routeName: 'LogInClient',
            action: {
              type: 'Navigation/NAVIGATE',
              routeName: 'LogInClientStack',
            },
          },
    );
  };

  selectComponent = (activePage) => () => this.setState({ activePage });

  /**
   * Go ahead and delete ExpoConfigView and replace it with your content;
   * we just wanted to give you a quick view of your config.
   */
  render() {
    const { t } = this.props;
    const { user, activePage } = this.state;
    const { mode } = this.props.modeReducer;
    const color = getModeColor(mode);

    const { worksPhotos } = user;
    if (worksPhotos) {
      for (let i = 0; i < worksPhotos.length; i++) {
        worksPhotos[i].source = {
          uri: `${config.url}/images/${worksPhotos[i].imageName}`,
        };
      }
    }

    const onlineStatus = getLastOnline(user.lastRequest);

    return (
      this.state.user !== 0 && (
        <ScrollView style={styles.masterRoot}>
          <View style={{ marginTop: '4%', alignSelf: 'center' }}>
            <Avatar
              rounded
              onPress={() => user.avatar && this.setState({ visibleAvatar: true })}
              size="xlarge"
              source={{
                uri: user.avatar
                  ? `${config.url}/images/${user.avatar.imageName}`
                  : 'https://media.istockphoto.com/photos/icon-of-a-businessman-avatar-or-profile-pic-picture-id474001892?k=6&m=474001892&s=612x612&w=0&h=6g0M3Q3HF8_uMQpYbkM9XAAoEDym7z9leencMcC4pxo=',
              }}
            />
          </View>
          <View
            style={{
              width: '95%',
              alignSelf: 'center',
              alignItems: 'center',
              borderBottomColor: '#cadadd',
              paddingBottom: 15,
              borderBottomWidth: 2,
            }}
          >
            <Text
              allowFontScaling={false}
              style={{ fontSize: 19, fontWeight: '500', textAlign: 'center' }}
            >
              {user.firstName} {user.lastName}
            </Text>
            {onlineStatus === 'online' ? (
              <Badge style={{ height: 20, marginBottom: 3, alignSelf: 'center' }} success>
                <Text allowFontScaling={false} style={{ color: '#fff' }}>
                  {onlineStatus}
                </Text>
              </Badge>
            ) : (
              <Text allowFontScaling={false} style={{ color: '#999999' }}>
                {onlineStatus}
              </Text>
            )}
            <View style={{ flexDirection: 'row' }}>
              <View style={{ flexDirection: 'row' }}>
                <AntDesign name="star" size={19} color={user.rating > 20 ? '#c20021' : '#999999'} />
                <Text allowFontScaling={false} style={styles.specilization}>
                  {user.rating > 0 ? '+' : ''}
                  {user.rating}{' '}
                </Text>
              </View>
              <View style={{ flexDirection: 'row' }}>
                <Text allowFontScaling={false} style={styles.info}>
                  | {getUserRating(user.rating)}{' '}
                </Text>
              </View>
              <View style={{ flexDirection: 'row' }}>
                <Text allowFontScaling={false} style={[styles.info]}>
                  | {getNamesLocal(user.city.cityName, user.city.cityNameKz)}
                </Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row' }}>
              <Image
                source={
                  user.status === 'VERIFIED'
                    ? require('../../assets/images/checked.png')
                    : require('../../assets/images/unchecked.png')
                }
                style={{
                  width: 16,
                  height: 18,
                  marginLeft: 1,
                }}
              />
              <Text allowFontScaling={false} style={[styles.info]}>
                {t(`profile:${user.status}`)} | {user.sex === 'M' ? t('profile:M') : t('profile:F')}
                , {user.birthday && getAge(user.birthday)} {t('profile:years')}
              </Text>
            </View>
          </View>

          <Segment style={{ backgroundColor: '#fff', width: '100%', marginTop: 10 }}>
            <Button
              large
              style={{
                backgroundColor: activePage === 1 ? color : '#e9f0f4',
                borderColor: 'transparent',
                width: '50%',
                height: 45,
              }}
              active={this.state.activePage === 1}
              onPress={this.selectComponent(1)}
            >
              <Text
                allowFontScaling={false}
                style={{
                  color: activePage === 1 ? '#fff' : '#999999',
                  fontWeight: '500',
                  textAlign: 'center',
                  width: '100%',
                }}
              >
                Анкета
              </Text>
            </Button>
            <Button
              large
              style={{
                backgroundColor: activePage === 2 ? color : '#e9f0f4',
                borderColor: 'transparent',
                width: '50%',
                height: 45,
              }}
              active={this.state.activePage === 2}
              onPress={this.selectComponent(2)}
            >
              <Text
                allowFontScaling={false}
                style={{
                  color: activePage === 2 ? '#fff' : '#999999',
                  textAlign: 'center',
                  fontWeight: '500',
                  width: '100%',
                }}
              >
                {t('profile:reviews')} ({user.reviews ? user.reviews.length : 0})
              </Text>
            </Button>
          </Segment>
          <Content padder>
            {this.state.activePage === 1 ? (
              <>
                <View
                  style={{
                    width: '95%',
                    alignSelf: 'center',
                    paddingHorizontal: 5,
                    borderBottomWidth: 2,
                    borderBottomColor: '#cadadd',
                  }}
                >
                  <View>
                    <Text allowFontScaling={false} style={styles.labelInfo}>
                      {t('profile:aboutMe')}
                    </Text>
                    {user.notes ? (
                      <Text allowFontScaling={false} style={styles.textInfo}>
                        {user.notes}
                      </Text>
                    ) : (
                      <View style={{ marginVertical: 5, width: '95%' }}>
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
                </View>
                <View
                  style={{
                    width: '95%',
                    alignSelf: 'center',
                    paddingHorizontal: 5,
                    borderBottomWidth: 2,
                    borderBottomColor: '#cadadd',
                  }}
                >
                  <View
                    style={{
                      paddingTop: 10,
                      width: '90%',
                      paddingBottom: 15,
                    }}
                  >
                    <Text allowFontScaling={false} style={{ color: '#b2bdbf', fontWeight: '400' }}>
                      Специализация:{' '}
                    </Text>
                    <View style={{ marginLeft: 10 }}>
                      {user.specializations.map(({ specName, specNameKz }, index) => (
                        <Text allowFontScaling={false} key={index} style={{ fontWeight: '500' }}>
                          {getNamesLocal(specName, specNameKz)}
                        </Text>
                      ))}
                    </View>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      paddingTop: 10,
                    }}
                  >
                    <Text allowFontScaling={false} style={{ color: '#b2bdbf', fontWeight: '400' }}>
                      {t('profile:masterType')}:{' '}
                    </Text>
                    <Text allowFontScaling={false} style={{ fontWeight: '500' }}>
                      {t(`profile:${user.masterType}`)}
                    </Text>
                  </View>
                  {user.masterType === 'COMPANY' && (
                    <View
                      style={{
                        flexDirection: 'row',
                        paddingTop: 10,
                      }}
                    >
                      <Text
                        allowFontScaling={false}
                        style={{ color: '#b2bdbf', fontWeight: '400' }}
                      >
                        {t('profile:orgName')}:{' '}
                      </Text>
                      <View>
                        <Text allowFontScaling={false} style={{ fontWeight: '500' }}>
                          {user.orgName}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>

                <View
                  style={{
                    width: '95%',
                    paddingBottom: 5,
                    paddingHorizontal: 5,
                    alignSelf: 'center',
                    borderBottomWidth: 2,
                    borderBottomColor: '#cadadd',
                  }}
                >
                  <Text allowFontScaling={false} style={styles.labelInfo}>
                    {t('profile:workPhotos')} ({user.worksPhotos && user.worksPhotos.length})
                  </Text>
                  <View
                    style={{
                      alignSelf: 'center',
                      flexWrap: 'wrap',
                      flexDirection: 'row',
                      width: '95%',
                      paddingVertical: 10,
                    }}
                  >
                    {user.worksPhotos && user.worksPhotos.length > 0 ? (
                      user.worksPhotos.map((photo, index) => {
                        return (
                          <View key={photo.id} style={{ flexDirection: 'row' }}>
                            <TouchableOpacity onPress={() => this.openImageView(index)}>
                              <Image
                                source={{
                                  uri: `${config.url}/images/${photo.imageName}`,
                                }}
                                style={{
                                  width: width / 4.2,
                                  height: width / 4.2,
                                  marginRight: 10,
                                  marginTop: 10,
                                }}
                              />
                            </TouchableOpacity>
                          </View>
                        );
                      })
                    ) : (
                      <View style={{ marginVertical: 5, width: '95%' }}>
                        <Text
                          allowFontScaling={false}
                          style={{
                            textAlign: 'center',
                            color: '#b2bdbf',
                            fontSize: 16,
                            fontWeight: '500',
                          }}
                        >
                          {t('simple:noPhoto')}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                <View
                  style={{
                    width: '95%',
                    paddingBottom: 5,
                    paddingHorizontal: 5,
                    marginBottom: 5,
                    alignSelf: 'center',
                    borderBottomWidth: 2,
                    borderBottomColor: '#cadadd',
                  }}
                >
                  <View>
                    <Text allowFontScaling={false} style={styles.labelInfo}>
                      Видео
                    </Text>
                    {user.videos.length ? (
                      <WebView
                        source={{
                          uri: `https://www.youtube.com/embed/${user.videos[0].link.substring(
                            user.videos[0].link.lastIndexOf('/') + 1,
                            user.videos[0].link.length,
                          )}`,
                        }}
                        useWebKit={true}
                        style={{
                          marginTop: 20,
                          width: '95%',
                          height: 220,
                          alignSelf: 'center',
                        }}
                      />
                    ) : (
                      <View style={{ marginVertical: 5, width: '95%' }}>
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

                <View
                  style={{
                    width: '95%',
                    paddingBottom: 5,
                    paddingHorizontal: 5,
                    marginBottom: 5,
                    alignSelf: 'center',
                    borderBottomWidth: 2,
                    borderBottomColor: '#cadadd',
                  }}
                >
                  <View>
                    <Text allowFontScaling={false} style={styles.labelInfo}>
                      {t('profile:servicesAndPrices')}
                    </Text>
                    {user.services.length ? (
                      user.services.map((usluga) => {
                        return (
                          <View
                            key={usluga.id}
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                              marginBottom: 7,
                              width: '100%',
                            }}
                          >
                            <View
                              style={{
                                backgroundColor: '#e9f0f4',
                                padding: 5,
                                width: '60%',
                              }}
                            >
                              <Text
                                allowFontScaling={false}
                                style={{ color: '#999999', fontSize: 15 }}
                              >
                                {usluga.serviceName}
                              </Text>
                            </View>
                            <View
                              style={{
                                backgroundColor: '#e9f0f4',
                                padding: 5,
                                width: '38%',
                              }}
                            >
                              <Text
                                allowFontScaling={false}
                                style={{ color: 'black', fontSize: 15 }}
                              >
                                {usluga.cost} {usluga.unit}
                              </Text>
                            </View>
                          </View>
                        );
                      })
                    ) : (
                      <View style={{ marginVertical: 5, width: '95%' }}>
                        <Text
                          allowFontScaling={false}
                          style={{
                            textAlign: 'center',
                            color: '#b2bdbf',
                            fontSize: 16,
                            fontWeight: '500',
                          }}
                        >
                          {t('simple:noServices')}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                <TouchableOpacity
                  style={{ width: '95%', alignSelf: 'center' }}
                  onPress={() => {
                    if (this.state.promo?.marketId) {
                      increaseViewCount('BANNER_FOLLOW', this.state.promo?.id);

                      const path =
                        this.props.navigation.state.routeName === 'MasterProfileForClient'
                          ? 'MarketMainProfileClientAll'
                          : 'MarketMainProfileClientBySpec';

                      this.props.navigation.navigate(path, {
                        marketId: this.state.promo.marketId,
                      });
                    }
                  }}
                >
                  <Image
                    style={{
                      borderRadius: 10,
                      height: getFontSize(250),
                    }}
                    resizeMode="contain"
                    source={{
                      uri: this.state.promo
                        ? `http://91.201.215.45:49153/images/${this.state.promo.image.imageName}`
                        : config.defaultImage,
                    }}
                  />
                </TouchableOpacity>
                <View style={{ width: '95%', alignSelf: 'center' }}>
                  {!this.state.hasOrder && (
                    <TouchableOpacity
                      onPress={() => this.setState({ gg: !this.state.gg })}
                      style={styles.diamond}
                    >
                      <View
                        style={{
                          transform: [{ rotate: '-45deg' }],
                        }}
                      >
                        <Entypo
                          name={this.state.gg ? 'circle-with-cross' : 'info'}
                          size={this.state.gg ? 15 : 12}
                          color="white"
                        />
                      </View>
                    </TouchableOpacity>
                  )}
                  {this.state.gg && (
                    <View
                      style={{
                        position: 'absolute',
                        width: width * 0.9,
                        backgroundColor: '#e3f7ff',
                        borderRadius: 20,
                        padding: 10,
                        top: 35,
                        zIndex: 1000000000,
                        elevation: Platform.OS === 'android' ? 50 : 0,
                      }}
                    >
                      <View
                        style={{
                          backgroundColor: '#e3f7ff',
                        }}
                      >
                        <Text
                          allowFontScaling={false}
                          style={{
                            textAlign: 'center',
                            color: '#999999',
                            fontWeight: '500',
                          }}
                        >
                          {t('simple:createToSee')}
                        </Text>
                        <Text
                          allowFontScaling={false}
                          style={{
                            textAlign: 'center',
                            color: '#999999',
                          }}
                        >
                          {t('simple:youCanCall')}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
                {this.props.navigation.getParam('notShowCallButton', false) || (
                  <Button
                    style={[styles.writeButton, this.state.gg ? { marginTop: 100 } : {}]}
                    onPress={() =>
                      this.state.hasOrder ? this._pressCall() : this.navigateToCreateOrder()
                    }
                    disabled={user.id === this.props.authReducer.id}
                    block
                  >
                    {this.state.hasOrder ? (
                      <View style={{ flexDirection: 'row', width: '100%' }}>
                        <View style={{}} />
                        <Feather name="phone-call" size={24} color="white" />
                        <Text
                          allowFontScaling={false}
                          style={{
                            position: 'absolute',
                            left: '38%',
                            color: 'white',
                            fontSize: 17,
                            fontWeight: '500',
                          }}
                        >
                          {t('simple:call')}
                        </Text>
                      </View>
                    ) : (
                      <Text
                        allowFontScaling={false}
                        style={{
                          color: 'white',
                          fontSize: 17,
                          fontWeight: '500',
                        }}
                      >
                        {t('menu:createOrder')}
                      </Text>
                    )}
                  </Button>
                )}
                <View style={{ height: 40 }} />
                <ImageView
                  glideAlways
                  images={worksPhotos}
                  imageIndex={this.state.imageIndex}
                  animationType="fade"
                  isVisible={this.state.visibleImage}
                  onClose={() => this.setState({ visibleImage: false })}
                />
              </>
            ) : (
              <View style={{ width: '100%', alignItems: 'center' }}>
                <View style={{ width: '90%' }}>
                  <Text allowFontScaling={false} style={styles.labelInfo}>
                    {t('profile:reviews')} ({user.reviews ? user.reviews.length : 0})
                  </Text>
                </View>
                <FlatList
                  data={
                    this.state.collapseReviews
                      ? user.reviews
                      : user.reviews
                      ? user.reviews.slice(0, 8)
                      : []
                  }
                  style={{ width: '100%' }}
                  renderItem={({ item, index }) => {
                    return (
                      <Comment
                        key={index}
                        text={item.text}
                        person={item.user}
                        grade={item.rating}
                        data={item.created}
                      />
                    );
                  }}
                  keyExtractor={(item) => item.id + ''}
                  ListEmptyComponent={
                    <Text
                      allowFontScaling={false}
                      style={{
                        fontSize: 16,
                        fontWeight: '500',
                        textAlign: 'center',
                        marginVertical: 20,
                        color: '#999999',
                      }}
                    >
                      {t('simple:noReviews')}
                    </Text>
                  }
                />
                {user.reviews && user.reviews.length > 8 && (
                  <TouchableOpacity
                    onPress={() =>
                      this.setState({
                        collapseReviews: !this.state.collapseReviews,
                      })
                    }
                    style={{ alignSelf: 'center', marginBottom: 10 }}
                  >
                    <Text
                      allowFontScaling={false}
                      style={{
                        color: '#c20021',
                        fontWeight: '500',
                        fontSize: 17,
                        marginVertical: 10,
                        textAlign: 'center',
                      }}
                    >
                      {this.state.collapseReviews ? 'Скрыть' : '+ См. еще'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </Content>
          <ImageView
            glideAlways
            images={[
              {
                source: {
                  uri: user.avatar && `${config.url}/images/${user.avatar.imageName}`,
                },
              },
            ]}
            imageIndex={0}
            animationType="fade"
            isVisible={this.state.visibleAvatar}
            onClose={() => this.setState({ visibleAvatar: false })}
          />

          <Modal
            animationType="slide"
            transparent={true}
            visible={this.state.visibleCreateOrderModal}
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
                  {t('simple:toCall')}
                </Text>

                <Button onPress={this.navigateToCreateOrder} style={styles.buttonModal}>
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
                    {t('menu:createOrder')}
                  </Text>
                </Button>
                <Button light onPress={() => this.setState({ visibleCreateOrderModal: false })}>
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
                    {t('simple:cancel')}
                  </Text>
                </Button>
              </View>
            </View>
          </Modal>
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
                  {t('simple:ifAgreedWeWillSend')}
                </Text>

                <Button
                  onPress={() => {
                    this.setState({ modalCallVisible: false });
                    this.sendToMaster();
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
        </ScrollView>
      )
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
    fontSize: 18,
    fontWeight: '400',
  },
  inputContainer: {
    borderBottomWidth: 1,
    alignSelf: 'center',
    width: '95%',
    borderBottomColor: '#8b998f',
    marginVertical: 3,
  },
  icons: {
    width: '17%',
    textAlign: 'right',
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
    marginBottom: 7,
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
    fontSize: 15,
    color: '#c1c3c7',
    lineHeight: 16,
  },
  specilization: {
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 19,
  },
  writeButton: {
    alignSelf: 'center',
    backgroundColor: '#c20021',
    width: '95%',
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 15,
    marginTop: 10,
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
  diamond: {
    width: 18,
    height: 18,
    alignSelf: 'flex-end',
    marginVertical: 10,
    marginRight: 10,
    backgroundColor: '#c20021',
    transform: [{ rotate: '45deg' }],
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
)(hoistStatics(withTranslation()(MasterProfileForClient), MasterProfileForClient));
