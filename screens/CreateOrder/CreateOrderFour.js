import { AntDesign, Feather } from '@expo/vector-icons';
import axios from 'axios';
import hoistStatics from 'hoist-non-react-statics';
import { Button, Spinner } from 'native-base';
import React, { Fragment } from 'react';
import { withTranslation } from 'react-i18next';
import {
  KeyboardAvoidingView,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import RadioForm, {
  RadioButton,
  RadioButtonInput,
  RadioButtonLabel,
} from 'react-native-simple-radio-button';
import { NavigationActions, StackActions } from 'react-navigation';
import { connect } from 'react-redux';
import { localizationChange } from '../../actions/localActions';
import { switchMode } from '../../actions/modeActions';
import i18n from '../../i18n';
import { store } from '../../store';
import { getModeColor } from '../../utils/getModeColor';
import config from '../../config/config';

class CreateOrderFour extends React.Component {
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
      contactType: 'CALL',
      modalVisible: false,
      spinning: false,
    };
  }
  componentDidMount() {
    const { mode } = this.props.modeReducer;

    this.props.navigation.setParams({
      handleClose: () => this.setModalVisible(true),
    });

    if (mode !== this.state.mode) {
      this.props.navigation.setParams({ color: getModeColor(mode) });
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

  textChange = (text, whichState) => {
    if (whichState === 'FIXED') {
      this.setState({ FIXED: text });
    } else {
      this.setState({ LIMITED_PRICE: text });
    }
  };

  setDate = (newDate) => {
    this.setState({ date: newDate, value: 'POINT_DATE' });
  };

  finishCreatingOrder = () => {
    this.setState({ spinning: false });
    this.props.navigation.navigate('Finished');
  };

  createOrder = () => {
    this.setState({ spinning: true });
    const { contactType } = this.state;
    const data = this.props.navigation.getParam('data');
    data.contactType = contactType;

    let urgencyDate = '';
    let price = 0;

    if (data.value === 'POINT_DATE') {
      urgencyDate = data.date;
    }

    if (data.value2 === 'FIXED') {
      price = parseInt(data.FIXED, 10);
    } else if (data.value2 === 'UP_TO') {
      price = parseInt(data.LIMITED_PRICE, 10);
    }

    let hasImages = false;

    const files = new FormData();
    for (let i = 0; i < data.images.length; i++) {
      const image = data.images[i];
      if (image !== '') {
        hasImages = true;
        files.append('files', {
          uri: image.uri,
          type: 'image/jpeg',
          name: 'order-picture',
        });
      }
    }

    const insertData = {
      address: data.address,
      coordinates: data.coordinates ? data.coordinates : null,
      communicationType: data.contactType,
      customer: this.props.authReducer.username,
      description: data.description,
      price: price,
      priceType: data.value2,
      specializationId: data.specId,
      urgency: data.value,
      urgencyDate: urgencyDate,
    };

    axios({
      method: 'POST',
      url: `${config.url}/api/v1/order/customer`,
      data: insertData,
    })
      .then((res) => {
        if (hasImages) {
          axios({
            method: 'POST',
            url: `${config.url}/api/v1/image/order/${res.data.id}`,
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            data: files,
          })
            .then(() => {
              this.finishCreatingOrder();
            })
            .catch((err) => {
              console.log('Здесь ошибка2', err);
            });
        } else {
          this.finishCreatingOrder();
        }
      })
      .catch((err) => {
        console.log('Здесь ошибка1', err);
      });
  };

  render() {
    const { t } = this.props;
    var radio_props = [
      {
        label: t('createOrder:CALL'),
        value: 'CALL',
        text: t('createOrder:callAdvantage'),
      },
      {
        label: t('createOrder:MESSAGE'),
        value: 'MESSAGE',
        text: t('createOrder:messageAdvantage'),
      },
    ];

    return this.state.spinning ? (
      <Spinner color="red" />
    ) : (
      <KeyboardAvoidingView style={styles.container}>
        <ScrollView
          style={{ flex: 1, width: '100%' }}
          contentContainerStyle={{ justifyContent: 'flex-end' }}
        >
          <View
            style={{
              width: '100%',
              alignItems: 'center',
              justifyContent: 'flex-end',
              paddingBottom: 20,
            }}
          >
            <View style={{ width: '90%', paddingVertical: 20 }}>
              <Text allowFontScaling={false} style={styles.titleText}>
                {t('createOrder:respondsFromMaster')}
              </Text>
              <RadioForm initial={0}>
                {radio_props.map((obj, i) => (
                  <Fragment key={`${i}`}>
                    <RadioButton style={{ marginVertical: 10 }} labelHorizontal={true} key={i}>
                      {/*  You can set RadioButtonLabel before RadioButtonInput */}
                      <RadioButtonInput
                        obj={obj}
                        index={i}
                        isSelected={this.state.contactType === obj.value}
                        onPress={(value) => {
                          this.setState({ contactType: value });
                        }}
                        borderWidth={1}
                        buttonInnerColor={'#c20021'}
                        buttonOuterColor={'#cadadd'}
                        buttonStyle={{}}
                        buttonSize={15}
                      />
                      <RadioButtonLabel
                        obj={obj}
                        index={i}
                        onPress={(value) => {
                          this.setState({ contactType: value });
                        }}
                        labelHorizontal={true}
                        labelStyle={{ fontSize: 17, textAlign: 'left' }}
                        labelWrapStyle={{
                          textAlign: 'left',
                          alignItems: 'flex-start',
                          justifyContent: 'flex-start',
                        }}
                      />
                    </RadioButton>
                    <View
                      style={{
                        alignItems: 'flex-start',
                        marginLeft: 30,
                        width: '90%',
                      }}
                    >
                      <Text allowFontScaling={false} style={styles.describeText}>
                        {obj.text}
                      </Text>
                    </View>
                  </Fragment>
                ))}
              </RadioForm>
            </View>
            <View style={{ width: '90%', alignItems: 'center' }}>
              <Button
                onPress={this.createOrder}
                style={{ backgroundColor: '#c20021', marginTop: 60 }}
                block
              >
                <Text allowFontScaling={false} style={styles.continuneText}>
                  {t('createOrder:publish')}
                </Text>
              </Button>
              <Text allowFontScaling={false} style={[styles.describeText, { textAlign: 'center' }]}>
                {t('createOrder:aggreement')}
              </Text>
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
                    paddingVertical: 15,
                    paddingHorizontal: 30,
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
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    width: '100%',
  },
  titleText: {
    fontSize: 19,
    fontWeight: '500',
    marginVertical: 10,
  },
  describeText: {
    fontSize: 14,
    color: '#999999',
    paddingVertical: 7,
  },
  buttonText: {
    color: '#c20021',
    fontSize: 13,
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

export default connect(
  ({ authReducer, modeReducer, localReducer }) => ({
    authReducer,
    modeReducer,
    localReducer,
  }),
  { switchMode, localizationChange },
)(hoistStatics(withTranslation()(CreateOrderFour), CreateOrderFour));
