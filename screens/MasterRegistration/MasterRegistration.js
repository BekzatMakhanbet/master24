import { AntDesign, Feather } from '@expo/vector-icons';
import axios from 'axios';
import hoistStatics from 'hoist-non-react-statics';
import { Button, DatePicker, Label, Picker, Spinner } from 'native-base';
import React, { Fragment } from 'react';
import { withTranslation } from 'react-i18next';
import {
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
import { Input } from 'react-native-elements';
import { ScrollView } from 'react-native-gesture-handler';
import RadioForm, {
  RadioButton,
  RadioButtonInput,
  RadioButtonLabel,
} from 'react-native-simple-radio-button';
import { connect } from 'react-redux';
import { login } from '../../actions/authActions';
import { localizationChange } from '../../actions/localActions';
import { switchMode } from '../../actions/modeActions';
import { getModeColor } from '../../utils/getModeColor';
import getNamesLocal from '../../utils/getNamesLocal';
import stylesObject from '../../constants/style/stylesObject';
import getFontSize from '../../utils/getFontSize';
import config from '../../config/config';
import moment from 'moment';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Datepicker } from '../../components/Datepicker/Datepicker';

const { height } = Dimensions.get('window');

class RegisterMaster extends React.Component {
  static navigationOptions = ({ navigation }) => {
    let { state } = navigation;
    return {
      title: state.params && state.params.title,
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
        backgroundColor: '#0288c7',
      },
      headerTitleStyle: {
        color: 'white',
      },
    };
  };
  constructor(props) {
    super(props);
    this.state = {
      name: props.authReducer.name,
      surname: props.authReducer.surname,
      date: '',
      sex: 'M',
      city: '1',
      fromWhere: '',
      specializations: [],
      choosed: [],
      masterType: '',
      orgName: '',
      modalVisible: false,
      show: false,
      loading: false,
    };
  }

  componentDidMount() {
    this.props.navigation.setParams({
      handleClose: () => this.setState({ modalVisible: true }),
    });

    axios.get(`${config.url}/api/v1/spec`).then((res) => {
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
    const specs = this.props.navigation.getParam('specs');
    if (specs !== this.state.choosed) {
      this.setState({ choosed: specs });
    }
  }

  finish = () => {
    this.props.navigation.navigate('MyOrders');
  };

  handleChange = (event, index, value) => this.setState({ value });

  register = () => {
    const date = new Date(this.state.date);
    const year = date.getFullYear();
    const month = date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
    const day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
    const birthday = `${year}-${month}-${day}`;

    this.setState({ loading: true });

    let body = {
      birthday,
      firstName: this.state.name,
      lastName: this.state.surname,
      isMaster: true,
      masterType: this.state.masterType,
      specializations: Array.from(new Set(this.state.choosed)),
      orgName: this.state.masterType === 'COMPANY' ? this.state.orgName : null,
    };
    axios
      .put(`${config.url}/api/v1/user/${this.props.authReducer.username}`, body)
      .then((res) => {
        const {
          firstName,
          lastName,
          city,
          sex,
          username,
          id,
          master,
          avatar,
          specializations,
        } = res.data;
        this.props.login(
          true,
          firstName,
          lastName,
          sex,
          city,
          username,
          id,
          master,
          this.props.authReducer.token,
          avatar,
          specializations,
        );
        // this.setState({ loading: false });

        this.props.switchMode();
        this.props.navigation.dispatch({
          type: 'Navigation/NAVIGATE',
          routeName: 'Profile',
          action: {
            type: 'Navigation/NAVIGATE',
            routeName: 'ProfileStack',
          },
        });
      })
      .catch((err) => {
        console.log('обнова', err);
      });
  };

  specNotCorrect = (specs) => {
    if (specs && specs.length) {
      const filtered = specs.filter((spec) => spec !== -1);

      return filtered.length === 0;
    } else {
      return true;
    }
  };

  render() {
    const { t } = this.props;
    let disabled =
      this.state.name.length === 0 ||
      this.state.date.length === 0 ||
      this.state.masterType.length === 0 ||
      this.specNotCorrect(this.state.choosed) ||
      this.state.date.length === 0;
    const { choosed } = this.state;
    let radio_props = [
      { label: t('profile:INDIVIDUAL'), value: 'INDIVIDUAL' },
      { label: t('profile:COMPANY'), value: 'COMPANY' },
    ];

    const { sex } = this.props.authReducer;

    return (
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" enabled>
        <ScrollView style={{ flexGrow: 1 }}>
          <View
            style={{
              justifyContent: 'space-between',
              alignItems: 'center',
              flex: 1,
              width: '100%',
              paddingVertical: 15,
              minHeight: height - 120,
            }}
          >
            <View style={styles.container}>
              <Input
                value={this.state.name}
                onChangeText={(name) => this.setState({ name })}
                leftIcon={
                  <Text
                    allowFontScaling={false}
                    style={[
                      stylesObject.defaultColorRed,
                      {
                        marginRight: 10,
                        marginLeft: -10,
                      },
                    ]}
                  >
                    *
                  </Text>
                }
                label={() => (
                  <Fragment>
                    <Text allowFontScaling={false} style={styles.inputLabel}>
                      {t('login:name')}
                    </Text>
                  </Fragment>
                )}
              />
              <Input
                value={this.state.surname}
                onChangeText={(surname) => this.setState({ surname })}
                leftIcon={
                  <Text
                    allowFontScaling={false}
                    style={[
                      stylesObject.defaultColorRed,
                      {
                        marginRight: 10,
                        marginLeft: -10,
                      },
                    ]}
                  >
                    {' '}
                  </Text>
                }
                label={() => (
                  <Fragment>
                    <Text allowFontScaling={false} style={styles.inputLabel}>
                      {t('login:surname')}
                    </Text>
                  </Fragment>
                )}
              />
              <View style={styles.inputContainer}>
                <Label style={styles.inputLabel}>{t('login:birthdayDate')}</Label>
                <View
                  style={[
                    stylesObject.defaultFlexRow,
                    {
                      marginBottom: 10,
                      marginTop: 10,
                      alignItems: 'center',
                    },
                  ]}
                >
                  <Text
                    allowFontScaling={false}
                    style={[
                      stylesObject.defaultColorRed,
                      {
                        marginLeft: getFontSize(5),
                      },
                    ]}
                  >
                    *
                  </Text>
                  <Text
                    onPress={() => this.setState({ show: true })}
                    style={[
                      styles.input,
                      { fontSize: getFontSize(17), marginLeft: getFontSize(5) },
                    ]}
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
                      onChange={(e, date) =>
                        this.setState({
                          date: date || this.state.date,
                          show: Platform.OS === 'ios',
                        })
                      }
                      disabled={false}
                    />
                  </View>
                </View>
              </View>
              <View style={styles.inputContainer}>
                <Label style={styles.inputLabel}>{t('login:sex')}</Label>
                <View style={[stylesObject.defaultFlexRow, { alignItems: 'center' }]}>
                  <Text
                    allowFontScaling={false}
                    style={[stylesObject.defaultColorRed, { marginLeft: getFontSize(5) }]}
                  >
                    *
                  </Text>
                  <Picker
                    headerBackButtonText={t('simple:back')}
                    iosHeader={t('simple:choose')}
                    selectedValue={sex}
                    onValueChange={(sex) => this.setState({ sex })}
                  >
                    <Picker.Item label={t('login:male')} value="M" />
                    <Picker.Item label={t('login:female')} value="F" />
                  </Picker>
                </View>
              </View>
            </View>
            <View style={styles.container}>
              <View style={styles.inputContainer2}>
                <Label style={styles.inputLabel}>{t('login:masterType')}</Label>
                <RadioForm initial={0}>
                  {radio_props.map((obj, i) => (
                    <RadioButton style={{ marginVertical: 10 }} labelHorizontal={true} key={i}>
                      {/*  You can set RadioButtonLabel before RadioButtonInput */}
                      <RadioButtonInput
                        obj={obj}
                        index={i}
                        isSelected={this.state.masterType === obj.value}
                        onPress={(value) => {
                          this.setState({ masterType: value });
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
                          this.setState({ masterType: value });
                        }}
                        labelHorizontal={true}
                        labelStyle={{ fontSize: 17, textAlign: 'left' }}
                        labelWrapStyle={{ textAlign: 'left' }}
                      />
                    </RadioButton>
                  ))}
                </RadioForm>
              </View>
            </View>
            {this.state.masterType === 'COMPANY' && (
              <Input
                inputContainerStyle={{ width: '94%', alignSelf: 'center' }}
                value={this.state.orgName}
                leftIcon={
                  <Text
                    allowFontScaling={false}
                    style={[
                      stylesObject.defaultColorRed,
                      {
                        marginRight: 10,
                        marginLeft: -10,
                      },
                    ]}
                  >
                    *
                  </Text>
                }
                onChangeText={(orgName) => this.setState({ orgName })}
                label={() => (
                  <Fragment>
                    <Text
                      allowFontScaling={false}
                      style={{
                        fontSize: 16,
                        color: '#8b998f',
                        marginLeft: '3%',
                        fontWeight: '500',
                      }}
                    >
                      {t('profile:orgName')}
                    </Text>
                  </Fragment>
                )}
              />
            )}
            <View style={styles.container}>
              <View style={styles.inputContainer}>
                <View>
                  <Label style={styles.inputLabel2}>{t('login:chooseSpec')}</Label>
                  <TouchableOpacity
                    onPress={() => {
                      this.props.navigation.navigate('SpecList');
                    }}
                    style={{
                      flexDirection: 'row',
                      width: '100%',
                      justifyContent: 'space-between',
                      marginTop: 10,
                    }}
                  >
                    {choosed ? (
                      <Text allowFontScaling={false}>
                        {choosed.map((elem) => {
                          const found = this.state.specializations.find((spec) => spec.id === elem);

                          if (found) {
                            console.log(found.specName);

                            return `${getNamesLocal(found.specName, found.specNameKz)}, `;
                          }
                        })}
                      </Text>
                    ) : (
                      <Text allowFontScaling={false} style={{ fontSize: 16 }}>
                        <Text
                          allowFontScaling={false}
                          style={[stylesObject.defaultColorRed, { marginRight: getFontSize(10) }]}
                        >
                          {' * '}
                        </Text>
                        {t('login:spec/s')}
                      </Text>
                    )}
                    <Feather name="chevron-right" size={26} color="#999999" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            <View style={styles.container}>
              {this.state.loading ? (
                <Spinner color="red" />
              ) : (
                <Button
                  onPress={this.register}
                  disabled={disabled}
                  style={{
                    backgroundColor: disabled ? '#cadadd' : getModeColor('master'),
                    borderRadius: 5,
                  }}
                  block
                  title={t('simple:ready')}
                >
                  <Text
                    allowFontScaling={false}
                    style={{ color: 'white', fontSize: 15, fontWeight: '500' }}
                  >
                    {t('login:ready')}
                  </Text>
                </Button>
              )}
            </View>
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
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: '94%',
    alignItems: 'center',
    justifyContent: 'space-around',
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
    backgroundColor: '#0288c7',
    width: '100%',
    alignItems: 'center',
    textAlign: 'center',
    marginVertical: 5,
  },
  onePicker: {
    width: '100%',
    borderWidth: 1,
  },
  onePickerItem: {
    width: '100%',
  },
});

export default connect(
  ({ modeReducer, localReducer, authReducer }) => ({
    modeReducer,
    localReducer,
    authReducer,
  }),
  { switchMode, localizationChange, login },
)(hoistStatics(withTranslation()(RegisterMaster), RegisterMaster));
