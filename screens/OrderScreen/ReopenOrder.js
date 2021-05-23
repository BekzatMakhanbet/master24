import { AntDesign, Feather, FontAwesome } from '@expo/vector-icons';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import hoistStatics from 'hoist-non-react-statics';
import { ActionSheet, Badge, Button, Label, Spinner } from 'native-base';
import React from 'react';
import { withTranslation } from 'react-i18next';
import {
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Input } from 'react-native-elements';
import { ScrollView } from 'react-native-gesture-handler';
import { NavigationActions, StackActions } from 'react-navigation';
import { connect } from 'react-redux';
import { login } from '../../actions/authActions';
import { localizationChange } from '../../actions/localActions';
import { switchMode } from '../../actions/modeActions';
import { CameraComponent } from '../../components/Camera/Camera';
import i18n from '../../i18n';
import getNamesLocal from '../../utils/getNamesLocal';
import OrderAddress from './OrderAddress';
import OrderCommunicationEditer from './OrderCommunicationEditer';
import OrderDateEditer from './OrderDateEditer';
import OrderPriceEditer from './OrderPriceEditer';
import config from '../../config/config';

const { width } = Dimensions.get('window');
const defaultImage = 'http://arabimagefoundation.com/images/defaultImage.png';

class ReopenOrderScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    let { state } = navigation;
    return {
      title: i18n.t('order:repeatOrder'),
      headerLeft: (
        <TouchableOpacity
          onPress={() => navigation.goBack(null)}
          style={{ paddingLeft: 10, width: 80 }}
        >
          <Feather size={26} name={'chevron-left'} color="white" />
        </TouchableOpacity>
      ),
      headerRight: (
        <TouchableOpacity
          onPress={state.params && state.params.handleClose}
          style={{ paddingRight: 15 }}
        >
          <AntDesign size={26} name={'close'} color="white" />
        </TouchableOpacity>
      ),
      headerLayoutPreset: 'center',
      headerStyle: {
        backgroundColor: '#c20021',
      },
      headerTitleStyle: {
        color: 'white',
      },
    };
  };
  constructor(props) {
    super(props);
    const {
      id = 0,
      specialization = {},
      description = '',
      address = '',
      coordinates = '',
      urgency = '',
      urgencyDate = '',
      orderPriceType = '',
      price = 0,
      communicationType = '',
    } = this.props.navigation.getParam('item', 0);

    this.state = {
      id,
      specialization,
      description,
      images: ['', '', ''],
      address,
      coordinates: {
        latitude: coordinates.length ? JSON.parse(coordinates.toLowerCase()).latitude : null,
        longitude: coordinates.length ? JSON.parse(coordinates.toLowerCase()).longitude : null,
      },
      urgency: 'URGENTLY',
      urgencyDate: '',
      orderPriceType,
      price,
      communicationType,
      choosed: [],
      modalVisible: false,
      deleteImages: [undefined, undefined, undefined],
      createImage: [undefined, undefined, undefined],
      spinning: false,
    };
  }

  _pickImage = async (index) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      aspect: [3, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      const { images, createImage } = this.state;
      const image = { ...result, source: { uri: result.uri } };
      createImage[index] = result;
      images[index] = image;
      this.setState({ images, createImage });
    }
  };

  componentDidMount() {
    const { token } = this.props.authReducer;
    const headers = {};

    this.props.navigation.setParams({
      handleClose: () => this.setState({ modalVisible: true }),
    });

    axios.get(`${config.url}/api/v1/spec`, { headers }).then((res) => {
      this.setState({ specializations: res.data.specializations });
    });
  }

  componentDidUpdate() {
    if (this.state.title !== this.props.t('login:registerMaster')) {
      this.props.navigation.setParams({
        title: this.props.t('login:registerMaster'),
      });
      this.setState({ title: this.props.t('login:registerMaster') });
      this.props.navigation.setParams({
        title: this.props.t('login:registerMaster'),
      });
    }
    const spec = this.props.navigation.getParam('spec');

    if (spec && spec != this.state.specialization) {
      this.setState({ specialization: spec });
    }
  }

  setOrderPriceType = (value) => {
    this.setState({ orderPriceType: value });
  };

  setPrice = (value) => {
    this.setState({ price: value });
  };

  setUrgency = (value) => {
    this.setState({ urgency: value });
  };

  setUrgencyDate = (value) => {
    this.setState({ urgencyDate: value, urgency: 'POINT_DATE' });
  };

  setCommunicationType = (value) => {
    this.setState({ communicationType: value });
  };

  setAddress = (value) => {
    this.setState({ address: value });
  };

  setCoordinates = (value) => {
    this.setState({ coordinates: value });
  };

  _cancelImage = async (index, imageId) => {
    const { images, deleteImages, createImage } = this.state;
    images[index] = undefined;
    if (imageId) {
      deleteImages.push(imageId);
    }

    createImage[index] = undefined;

    this.setState({ images, deleteImages });
  };

  finish = () => {
    const navigateAction = StackActions.reset({
      index: 0,
      key: null,
      actions: [NavigationActions.navigate({ routeName: 'MyOrders' })],
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

  handleChange = (event, index, value) => this.setState({ value });

  updateOrder = () => {
    this.setState({ spinning: true });
    let body = {
      address: this.state.address,
      coordinates: this.state.coordinates.latitude ? JSON.stringify(this.state.coordinates) : '',
      communicationType: this.state.communicationType,
      customer: this.props.authReducer.username,
      specializationId: this.state.specialization.id,
      description: this.state.description,
      priceType: this.state.orderPriceType,
      price: this.state.price,
      urgency: this.state.urgency,
    };
    if (!Array.isArray(this.state.urgencyDate)) {
      body.urgencyDate = this.state.urgencyDate;
    }
    axios({
      method: 'POST',
      url: `${config.url}/api/v1/order/customer`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: body,
    })
      .then(async (res) => {
        const files = new FormData();
        let hasImage = false;
        this.state.createImage.forEach((image) => {
          if (image) {
            hasImage = true;
            files.append('files', {
              uri: image.uri,
              type: 'image/jpeg',
              name: 'order-picture',
            });
          }
        });

        if (hasImage) {
          await axios({
            method: 'POST',
            url: `${config.url}/api/v1/image/order/${res.data.id}`,
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            data: files,
          });
        }

        this.setState({ spinning: false });
        this.finish();
      })
      .catch((err) => {
        console.log(err);
      });
  };

  render() {
    const { t } = this.props;

    const {
      specialization,
      images,
      description,
      address,
      coordinates,
      urgency,
      urgencyDate,
      orderPriceType,
      price,
      communicationType,
    } = this.state;

    return (
      <ScrollView style={{ flexGrow: 1 }}>
        <KeyboardAvoidingView behavior="padding" enabled>
          {this.state.spinning ? (
            <Spinner spinning={this.state.spinning} color="red" />
          ) : (
            <View
              style={{
                alignItems: 'center',
                flex: 1,
                width: '100%',
                paddingVertical: 15,
                marginBottom: description.split('\n').length * 20,
              }}
            >
              {this.state.camera && (
                <CameraComponent
                  saveImage={(data, index) => {
                    const { images, createImage } = this.state;
                    const image = { ...data, source: { uri: data.uri } };
                    createImage[index] = data;
                    images[index] = image;
                    this.setState({ images, createImage });
                  }}
                  closeCamera={() => this.setState({ camera: false })}
                  index={this.state.index}
                />
              )}
              <View style={styles.container}>
                <View style={styles.inputContainer}>
                  <View>
                    <Label style={styles.inputLabel2}>Специализация</Label>
                    <TouchableOpacity
                      onPress={() => {
                        this.props.navigation.navigate('ReopenSpecList');
                      }}
                      style={{
                        flexDirection: 'row',
                        width: '100%',
                        justifyContent: 'space-between',
                        marginTop: 10,
                      }}
                    >
                      <Text allowFontScaling={false} style={{ fontSize: 16 }}>
                        {specialization.specName &&
                          getNamesLocal(specialization.specName, specialization.specNameKz)}
                      </Text>
                      <Feather name="chevron-right" size={26} color="#999999" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <View style={styles.container}>
                <View style={{ width: '95%' }}>
                  <View>
                    <Label style={styles.inputLabel2}>{t('createOrder:describe')}</Label>
                    <Input
                      value={description}
                      multiline={true}
                      rightIcon={
                        <AntDesign
                          onPress={() => this.setState({ description: '' })}
                          name="close"
                          size={24}
                          color="#999999"
                        />
                      }
                      onChangeText={(val) =>
                        val.length <= 200 && this.setState({ description: val })
                      }
                      inputContainerStyle={{
                        width: '105%',
                        marginLeft: '-2.5%',
                      }}
                      placeholder={t('createOrder:example')}
                    />
                    <Text
                      allowFontScaling={false}
                      style={[styles.describeText, { textAlign: 'right' }]}
                    >
                      {description.length}/200
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.container}>
                <View style={styles.imagesRoot}>
                  {images.map((image, index) => {
                    return (
                      <View key={index}>
                        {image ? (
                          <Badge
                            style={{
                              marginLeft: width / 5 - 5,
                              justifyContent: 'center',
                              alignItems: 'center',
                            }}
                          >
                            <FontAwesome
                              onPress={() => this._cancelImage(index, image.id)}
                              name="trash-o"
                              color={'#fff'}
                              size={20}
                            />
                          </Badge>
                        ) : null}
                        <TouchableOpacity
                          style={{ marginTop: !image ? 25 : 0 }}
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
                            } else if (this.state.images[index - 1] && !image) {
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
                              uri: !image ? defaultImage : image.source.uri,
                            }}
                          />
                          {!image && (
                            <View
                              style={{
                                position: 'absolute',
                                left: width / 10 - 17,
                                top: width / 10 - 18,
                                backgroundColor:
                                  index === 0
                                    ? '#c20021'
                                    : images[index - 1] && !image
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
                    );
                  })}
                </View>
              </View>

              <OrderAddress
                address={address}
                t={t}
                setAddress={this.setAddress}
                coordinates={coordinates}
                setCoordinates={this.setCoordinates}
              />

              <OrderDateEditer
                urgency={urgency}
                urgencyDate={urgencyDate}
                t={t}
                setUrgency={this.setUrgency}
                setUrgencyDate={this.setUrgencyDate}
              />

              <OrderPriceEditer
                orderPriceType={orderPriceType}
                price={price}
                t={t}
                setOrderPriceType={this.setOrderPriceType}
                setPrice={this.setPrice}
              />

              <OrderCommunicationEditer
                communicationType={communicationType}
                t={t}
                setCommunicationType={this.setCommunicationType}
              />

              <View style={styles.container}>
                <TouchableOpacity onPress={this.updateOrder}>
                  <Text
                    allowFontScaling={false}
                    style={{
                      fontSize: 16,
                      color: '#c20021',
                      marginVertical: 5,
                    }}
                  >
                    {t('order:repeatOrder')}
                  </Text>
                </TouchableOpacity>
              </View>

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
                      {t('simple:creatingWillStop')}
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
                    <Button light onPress={() => this.setState({ modalVisible: false })}>
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
            </View>
          )}
        </KeyboardAvoidingView>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: '94%',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  requiredText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'left',
    alignSelf: 'flex-start',
    marginLeft: 10,
  },
  inputContainer: {
    borderBottomWidth: 1,
    width: '95%',
    borderBottomColor: '#8b998f',
    marginVertical: 1,
  },
  inputLabel: {
    fontSize: 16,
    color: '#8b998f',
    marginLeft: 2,
    fontWeight: '500',
  },
  inputLabel2: {
    fontSize: 13,
    color: '#8b998f',
    marginLeft: 2,
    fontWeight: '500',
  },
  inputContainer2: {
    width: '95%',
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
  imagesRoot: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    width: '100%',
  },
  image: {
    width: width / 5,
    height: width / 5,
  },
});

export default connect(
  ({ modeReducer, localReducer, authReducer }) => ({
    modeReducer,
    localReducer,
    authReducer,
  }),
  { switchMode, localizationChange, login },
)(hoistStatics(withTranslation()(ReopenOrderScreen), ReopenOrderScreen));
