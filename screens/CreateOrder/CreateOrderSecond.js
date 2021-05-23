/* eslint-disable no-alert */
import { AntDesign, Feather, FontAwesome } from '@expo/vector-icons';
import Constants from 'expo-constants';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';
import hoistStatics from 'hoist-non-react-statics';
import { ActionSheet, Badge, Button, Spinner, Toast } from 'native-base';
import React from 'react';
import { withTranslation } from 'react-i18next';
import {
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Input } from 'react-native-elements';
import MapView, { Marker } from 'react-native-maps';
import { NavigationActions, StackActions } from 'react-navigation';
import { Header } from 'react-navigation-stack';
import { connect } from 'react-redux';
import { localizationChange } from '../../actions/localActions';
import { switchMode } from '../../actions/modeActions';
import { CameraComponent } from '../../components/Camera/Camera';
import i18n from '../../i18n';
import { store } from '../../store';
import { getModeColor } from '../../utils/getModeColor';

const { width } = Dimensions.get('window');
const defaultImage = 'http://arabimagefoundation.com/images/defaultImage.png';

class CreateOrderSecond extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const { state } = navigation;
    const { params = {} } = navigation.state;

    return {
      title: i18n.t('menu:createOrder'),
      headerRight: (
        <TouchableOpacity onPress={params.handleClose} style={{ paddingRight: 10 }}>
          <AntDesign size={26} name={'close'} color="white" />
        </TouchableOpacity>
      ),
      headerLeft: (
        <TouchableOpacity
          onPress={() => navigation.goBack(null)}
          style={{ paddingLeft: 10, width: 80 }}
        >
          <Feather size={26} name={'chevron-left'} color="white" />
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
      headerTintColor: '#fff',
    };
  };
  constructor(props) {
    super(props);
    this.state = {
      mode: '',
      clicked: 'hello',
      images: ['', '', ''],
      description: '',
      address: '',
      modalVisible: false,
      hasCoords: false,
      asking: false,
      camera: false,
      index: 0,
    };
  }
  componentDidMount() {
    this.getPermissionAsync();
    this.props.navigation.setParams({
      handleClose: () => this.setModalVisible(true),
    });
    const { mode } = this.props.modeReducer;

    if (mode !== this.state.mode) {
      this.props.navigation.setParams({ color: getModeColor(mode) });
      this.setState({ mode });
    }
  }

  navigateToNext = () => {
    //Go to the next screen of Order creating
    const { description, address, markerData, hasCoords, images } = this.state;
    const data = {
      description,
      address: address,
      images,
      coordinates: hasCoords ? JSON.stringify(markerData) : null,
      specId: this.props.navigation.getParam('spec'),
    };
    this.props.navigation.navigate('CreateOrderThree', { data });
  };

  componentDidUpdate() {
    const { mode } = this.props.modeReducer;
    if (mode !== this.state.mode) {
      this.props.navigation.setParams({ color: getModeColor(mode) });
      this.setState({ mode });
    }
  }

  getPermissionAsync = async (index) => {
    if (Constants.platform.ios) {
      const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
      if (status !== 'granted') {
        alert('Нужен доступ к вашей камере!');
      }
    }
  };

  _getLocationAsync = async () => {
    // Получаем информацию about location
    this.setState({ asking: true });
    let { status } = await Permissions.askAsync(Permissions.LOCATION);

    if (status !== 'granted') {
      this.setState({ asking: false });
    } else {
      let location = await Location.getCurrentPositionAsync({
        enableHighAccuracy: true,
      }).catch(() => {
        this.setState({ asking: false, hasCoords: false });
        Toast.show({
          text: 'Произошла ошибка. Проверьте включена ли у вас геолокация!',
          duration: 3000,
        });
      });
      const { latitude, longitude } = location.coords;
      //set Information location to map
      this.setState({
        markerData: { latitude, longitude },
        mapData: {
          latitude,
          longitude,
          latitudeDelta: 0.015,
          longitudeDelta: 0.0121,
        },
        hasCoords: true,
        asking: false,
      });
    }
  };

  _pickImage = async (index) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      aspect: [3, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      const { images } = this.state;
      images[index] = result;
      this.setState({ images });
    }
  };

  handleRegionChange = (mapData) => {
    this.setState({
      markerData: { latitude: mapData.latitude, longitude: mapData.longitude },
      mapData,
    });
  };

  _cancelImage = async (index) => {
    const { images } = this.state;
    images[index] = '';
    this.setState({ images });
  };

  setModalVisible = (value) => {
    this.setState({ modalVisible: value });
  };

  finish = () => {
    const navigateAction = StackActions.reset({
      index: 0,
      key: null,
      actions: [NavigationActions.navigate({ routeName: 'CreateOrder' })],
    });
    this.props.navigation.dispatch(navigateAction);

    this.props.navigation.dispatch({
      type: 'Navigation/NAVIGATE',
      routeName: 'MyOrders',
      action: {
        type: 'Navigation/NAVIGATE',
        routeName: 'MyOrdersStack',
      },
    });
  };

  render() {
    const { t } = this.props;
    const { description, address } = this.state;

    const disabled = !(this.state.description.length > 0 && this.state.address.length > 0);

    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Header.HEIGHT + 20}
        enabled
      >
        <ScrollView
          style={{ flex: 1, width: '100%' }}
          contentContainerStyle={{ justifyContent: 'flex-end' }}
        >
          <View
            style={{
              width: '100%',
              flex: 1,
              alignItems: 'center',
            }}
          >
            <View style={{ width: '90%', paddingVertical: 20 }}>
              <Text allowFontScaling={false} style={styles.titleText}>
                {t('createOrder:describe')}
              </Text>
              <Input
                multiline={true}
                scrollEnabled={false}
                value={description}
                onChangeText={(val) => val.length <= 200 && this.setState({ description: val })}
                inputContainerStyle={{ width: '105%', marginLeft: '-2.5%' }}
                placeholder={t('createOrder:example')}
              />
              <View
                style={{
                  width: '90%',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}
              >
                <Text allowFontScaling={false} style={[styles.describeText]}>
                  {t('createOrder:helps')}
                </Text>
                <Text
                  allowFontScaling={false}
                  style={[styles.describeText, { textAlign: 'right' }]}
                >
                  {description.length}/200
                </Text>
              </View>

              <View style={styles.imagesRoot}>
                {this.state.images.map((image, index) => (
                  <View key={index}>
                    {image === '' || (
                      <Badge
                        style={{
                          marginLeft: width / 5 - 5,
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        <FontAwesome
                          onPress={() => this._cancelImage(index)}
                          name="trash-o"
                          color={'#fff'}
                          size={20}
                        />
                      </Badge>
                    )}

                    <TouchableOpacity
                      style={{ marginTop: image === '' ? 25 : 0 }}
                      onPress={() => {
                        if (index === 0) {
                          ActionSheet.show(
                            {
                              options: [
                                t('simple:selectFromGallery'),
                                t('simple:makePhoto'),
                                t('simple:close'),
                              ],
                              cancelButtonIndex: 2,
                              title: t('simple:addPhoto'),
                            },
                            (buttonIndex) => {
                              if (buttonIndex === 0) {
                                this._pickImage(index);
                              } else if (buttonIndex === 1) {
                                this.setState({ camera: true, index });
                              }
                            },
                          );
                        } else if (this.state.images[index - 1] !== '' && image === '') {
                          ActionSheet.show(
                            {
                              options: [
                                t('simple:selectFromGallery'),
                                t('simple:makePhoto'),
                                t('simple:close'),
                              ],
                              cancelButtonIndex: 2,
                              title: t('simple:addPhoto'),
                            },
                            (buttonIndex) => {
                              if (buttonIndex === 0) {
                                this._pickImage(index);
                              } else if (buttonIndex === 1) {
                                this.setState({ camera: true, index });
                              }
                            },
                          );
                        }
                      }}
                    >
                      <Image
                        style={styles.image}
                        source={{
                          uri: image === '' ? defaultImage : image.uri,
                        }}
                      />
                      {image === '' && (
                        <View
                          style={{
                            position: 'absolute',
                            left: width / 10 - 17,
                            top: width / 10 - 18,
                            backgroundColor:
                              index === 0
                                ? '#c20021'
                                : this.state.images[index - 1] !== '' && image === ''
                                ? '#c20021'
                                : '#999999',
                            borderRadius: 50,
                            padding: 8,
                          }}
                        >
                          <AntDesign name="camerao" color={'#fff'} size={18} />
                        </View>
                      )}
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
              <Text allowFontScaling={false} style={[styles.describeText, { textAlign: 'center' }]}>
                ({t('createOrder:ifNeeded')})
              </Text>

              <Text allowFontScaling={false} style={styles.titleText}>
                {t('createOrder:pointAddress')}
              </Text>
              <Input
                value={address}
                onChangeText={(val) => this.setState({ address: val })}
                inputContainerStyle={{ width: '105%', marginLeft: '-2.5%' }}
                placeholder={t('createOrder:addressExample')}
              />
              {this.state.hasCoords && (
                <MapView
                  style={{
                    marginVertical: 10,
                    alignSelf: 'stretch',
                    height: 200,
                  }}
                  region={this.state.mapData}
                  onRegionChangeComplete={this.handleRegionChange}
                >
                  <Marker coordinate={this.state.markerData} title="Адрес" />
                </MapView>
              )}
              <Text allowFontScaling={false} style={styles.describeText}>
                {t('createOrder:addressHelps')}
              </Text>
              <Button
                onPress={() => {
                  if (this.state.hasCoords) {
                    this.setState({ hasCoords: false });
                  } else {
                    this._getLocationAsync();
                  }
                }}
                small
                style={{ width: '65%', marginTop: 10 }}
                light
              >
                {this.state.asking ? (
                  <View style={{ alignSelf: 'center' }}>
                    <Spinner color="red" />
                  </View>
                ) : (
                  <Text allowFontScaling={false} style={styles.buttonText}>
                    <FontAwesome name="paper-plane-o" size={20} />{' '}
                    {this.state.hasCoords ? 'Закрыть карту' : t('createOrder:myLocation')}
                  </Text>
                )}
              </Button>
            </View>
          </View>
          {this.state.camera && (
            <CameraComponent
              saveImage={(data, index) => {
                const { images } = this.state;
                images[index] = data;
                this.setState({ images });
              }}
              closeCamera={() => this.setState({ camera: false })}
              index={this.state.index}
            />
          )}
        </ScrollView>

        <Button
          disabled={disabled}
          onPress={this.navigateToNext}
          style={{
            backgroundColor: disabled ? '#cadadd' : '#c20021',
            width: '90%',
            alignSelf: 'center',
            marginTop: 5,
            marginBottom: 5,
          }}
          block
        >
          <Text allowFontScaling={false} style={styles.continuneText}>
            {t('createOrder:continuneButton')}
          </Text>
        </Button>

        <Modal animationType="slide" transparent={true} visible={this.state.modalVisible}>
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
              <Text allowFontScaling={false} style={styles.titleTextModal}>
                {t('simple:answersWillBeReset')}
              </Text>
              <Button onPress={this.finish} style={styles.buttonModal}>
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
                  {t('simple:resetAndQuit')}
                </Text>
              </Button>
              <Button light onPress={() => this.setModalVisible(false)}>
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
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  image: {
    width: width / 5,
    height: width / 5,
  },
  titleText: {
    fontSize: 19,
    fontWeight: '500',
  },
  describeText: {
    fontSize: 14,
    color: '#999999',
    paddingVertical: 7,
  },
  imagesRoot: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  imagesContainer: {},
  buttonText: {
    color: '#c20021',
    fontSize: 14,
    fontWeight: '500',
  },
  titleTextModal: {
    fontSize: 24,
    marginBottom: 10,
    fontWeight: '600',
    width: '100%',
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
  continuneText: {
    fontSize: 17,
    fontWeight: '500',
    color: '#fff',
  },
});

export default connect(({ modeReducer, localReducer }) => ({ modeReducer, localReducer }), {
  switchMode,
  localizationChange,
})(hoistStatics(withTranslation()(CreateOrderSecond), CreateOrderSecond));
