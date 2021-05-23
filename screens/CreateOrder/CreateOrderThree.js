import { AntDesign, Feather } from '@expo/vector-icons';
import hoistStatics from 'hoist-non-react-statics';
import { Button, DatePicker, Spinner } from 'native-base';
import React from 'react';
import { withTranslation } from 'react-i18next';
import {
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
import { Input } from 'react-native-elements';
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
import Axios from 'axios';
import config from '../../config/config';
import getFontSize from '../../utils/getFontSize';
import stylesObject from '../../constants/style/stylesObject';
import moment from 'moment';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Datepicker } from '../../components/Datepicker/Datepicker';

const { height } = Dimensions.get('window');

class CreateOrderThree extends React.Component {
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
      spinning: false,
      clicked: 'hello',
      value: 'URGENTLY',
      value2: 'FIXED',
      modalVisible: false,
      LIMITED_PRICE: '',
      FIXED: '',
      date: '',
      show: false,
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

  setDate = (event, selectedDate) => {
    if (selectedDate) {
      this.setState({ date: selectedDate, value: 'POINT_DATE' });
    }
    this.setState({ show: Platform.OS === 'ios' });
  };

  navigateToNext = () => {
    const { value, value2, FIXED, LIMITED_PRICE, date } = this.state;
    const data = this.props.navigation.getParam('data');

    const next_data = { ...data, value, value2, FIXED, LIMITED_PRICE, date };
    this.props.navigation.navigate('CreateOrderFour', { data: next_data });
  };

  finishCreatingOrder = () => {
    this.setState({ spinning: false });
    this.props.navigation.navigate('Finished');
  };

  createOrder = () => {
    this.setState({ spinning: true });

    const { value, value2, FIXED, LIMITED_PRICE, date } = this.state;
    const data_last = this.props.navigation.getParam('data');

    const data = { ...data_last, value, value2, FIXED, LIMITED_PRICE, date };

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
      customer: this.props.authReducer.username,
      description: data.description,
      price: price,
      communicationType: 'MESSAGE',
      priceType: data.value2,
      specializationId: data.specId,
      urgency: data.value,
      urgencyDate: urgencyDate,
    };

    Axios({
      method: 'POST',
      url: `${config.url}/api/v1/order/customer`,
      data: insertData,
    })
      .then((res) => {
        if (hasImages) {
          Axios({
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
      { label: t('createOrder:urgent'), value: 'URGENTLY' },
      { label: t('createOrder:solveWithMaster'), value: 'WITH_MASTER' },
      { label: t('createOrder:calendar'), value: 'POINT_DATE' },
    ];

    var radio_props2 = [
      { label: t('createOrder:fixedPrice'), value: 'FIXED' },
      { label: t('createOrder:maxPrice'), value: 'UP_TO' },
      { label: t('createOrder:solveWithMasterMoney'), value: 'CONTRACTUAL' },
    ];

    const { value, value2, date, FIXED, LIMITED_PRICE } = this.state;

    let disabled = false;

    if (value === 'POINT_DATE' && date === '') {
      disabled = true;
    }
    if (value2 === 'FIXED' && FIXED === '') {
      disabled = true;
    }
    if (value2 === 'UP_TO' && LIMITED_PRICE === '') {
      disabled = true;
    }

    return this.state.spinning ? (
      <Spinner color="red" />
    ) : (
      <KeyboardAvoidingView style={styles.container} behavior="padding" enabled>
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
                {t('createOrder:whenToStart')}
              </Text>
              <RadioForm initial={0}>
                {radio_props.map((obj, i) => (
                  <RadioButton style={{ marginVertical: 10 }} labelHorizontal={true} key={i}>
                    {/*  You can set RadioButtonLabel before RadioButtonInput */}
                    <RadioButtonInput
                      obj={obj}
                      onPress={(radValue) => {
                        this.setState({ value: radValue });
                      }}
                      index={i}
                      isSelected={this.state.value === obj.value}
                      borderWidth={1}
                      buttonInnerColor={'#c20021'}
                      buttonOuterColor={'#cadadd'}
                      buttonStyle={{}}
                      buttonSize={15}
                    />
                    <View>
                      {i === 2 ? (
                        <View style={[stylesObject.defaultFlexRowCentered]}>
                          <Text
                            onPress={() => this.setState({ show: true })}
                            style={[styles.input, { fontSize: getFontSize(18), marginLeft: 10 }]}
                          >
                            {this.state.date
                              ? moment(this.state.date).format('DD/MM/YYYY')
                              : t('createOrder:calendar')}
                          </Text>
                          <View style={{ width: '100%' }}>
                            <Datepicker
                              show={this.state.show}
                              setShow={(show) => this.setState({ show })}
                              value={this.state.date || new Date()}
                              onChange={this.setDate}
                              disabled={false}
                            />
                          </View>
                        </View>
                      ) : (
                        <RadioButtonLabel
                          obj={obj}
                          index={i}
                          onPress={(radValue) => {
                            this.setState({ value: radValue });
                          }}
                          labelHorizontal={true}
                          labelStyle={{ fontSize: 17, textAlign: 'left' }}
                          labelWrapStyle={{ textAlign: 'left' }}
                        />
                      )}
                    </View>
                  </RadioButton>
                ))}
              </RadioForm>
              <View
                style={{
                  width: '100%',
                  alignSelf: 'center',
                  borderWidth: 1,
                  height: 1,
                  borderColor: '#cadadd',
                  marginVertical: 20,
                }}
              />
              <Text allowFontScaling={false} style={styles.titleText}>
                {t('createOrder:givePrice')}
              </Text>
              <RadioForm initial={0}>
                {radio_props2.map((obj, i) => (
                  <RadioButton style={{ marginVertical: 20 }} labelHorizontal={true} key={i}>
                    {/*  You can set RadioButtonLabel before RadioButtonInput */}
                    <RadioButtonInput
                      obj={obj}
                      index={i}
                      isSelected={this.state.value2 === obj.value}
                      borderWidth={1}
                      onPress={(radValue) => {
                        this.setState({ value2: radValue });
                      }}
                      buttonInnerColor={'#c20021'}
                      buttonOuterColor={'#cadadd'}
                      buttonStyle={{}}
                      buttonSize={15}
                    />
                    <View>
                      <RadioButtonLabel
                        obj={obj}
                        index={i}
                        labelHorizontal={true}
                        onPress={(radValue) => {
                          this.setState({ value2: radValue });
                        }}
                        labelStyle={{ fontSize: 17, textAlign: 'left' }}
                        labelWrapStyle={{ textAlign: 'left' }}
                      />
                      {i < 2 && (
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'flex-end',
                            width: 120,
                          }}
                        >
                          <Input
                            maxLength={8}
                            onChangeText={(text) => {
                              this.textChange(text, obj.value);
                              this.setState({
                                value2: i === 0 ? 'FIXED' : 'UP_TO',
                              });
                            }}
                            value={this.state.value2 === obj.value ? this.state[obj.value] : ''}
                            keyboardType="numeric"
                            inputContainerStyle={{ height: 30 }}
                            inputStyle={{ fontSize: 18, width: 110 }}
                            placeholder="0"
                          />
                          <Text allowFontScaling={false}>тг</Text>
                        </View>
                      )}
                    </View>
                  </RadioButton>
                ))}
              </RadioForm>
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

        <View style={{ width: '90%', alignItems: 'center' }}>
          <Button
            onPress={this.createOrder}
            disabled={disabled}
            style={{
              backgroundColor: disabled ? '#cadadd' : getModeColor('client'),
              marginTop: 10,
              marginBottom: 10,
            }}
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
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    minHeight: height - getFontSize(150),
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
  ({ modeReducer, localReducer, authReducer }) => ({ modeReducer, localReducer, authReducer }),
  {
    switchMode,
    localizationChange,
  },
)(hoistStatics(withTranslation()(CreateOrderThree), CreateOrderThree));
