import { AntDesign, Feather } from '@expo/vector-icons';
import axios from 'axios';
import { Notifications } from 'expo';
import * as Permissions from 'expo-permissions';
import hoistStatics from 'hoist-non-react-statics';
import { Button, Container, Label, Picker, Spinner } from 'native-base';
import React, { Fragment } from 'react';
import { withTranslation } from 'react-i18next';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Input } from 'react-native-elements';
import { ScrollView } from 'react-native-gesture-handler';
import { connect } from 'react-redux';
import { login } from '../../actions/authActions';
import { localizationChange } from '../../actions/localActions';
import { switchMode } from '../../actions/modeActions';
import { getModeColor } from '../../utils/getModeColor';
import getNamesLocal from '../../utils/getNamesLocal';
import config from '../../config/config';

class RegisterClient extends React.Component {
  static navigationOptions = ({ navigation }) => {
    let { state } = navigation;
    return {
      title: state.params && state.params.title,
      headerLeft: (
        <TouchableOpacity
          onPress={() => navigation.goBack(null)}
          style={{ paddingLeft: 10, width: 80 }}
        >
          <Feather size={26} name={'chevron-left'} color="black" />
        </TouchableOpacity>
      ),
      headerRight: (
        <TouchableOpacity onPress={navigation.openDrawer} style={{ paddingRight: 15 }}>
          <AntDesign size={26} name={'close'} color="black" />
        </TouchableOpacity>
      ),
      headerLayoutPreset: 'center',
      headerStyle: {
        backgroundColor: '#e3f7ff',
      },
      headerTitleStyle: {
        color: 'black',
      },
    };
  };
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      surname: '',
      sex: 'M',
      city: '1',
      fromWhere: '',
      cities: [],
      aboutServices: [],
      spinning: false,
    };
  }

  componentDidMount() {
    this.props.navigation.setParams({ title: this.props.t('login:register') });
    this.refresh();
  }

  refresh = () => {
    axios
      .get(`${config.url}/api/v1/about-service/about-service`)
      .then((res) => {
        this.setState({ aboutServices: res.data.aboutServices });
      })
      .catch((err) => {
        console.log(err);
      });
    axios
      .get(`${config.url}/api/v1/city/all`)
      .then((res) => {
        this.setState({ spinning: false, cities: res.data.cities });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  componentDidUpdate() {
    if (this.state.title !== this.props.t('login:register')) {
      this.props.navigation.setParams({
        title: this.props.t('login:register'),
      });
      this.setState({ title: this.props.t('login:register') });
    }
  }
  handleChange = (event, index, value) => this.setState({ value });

  register = () => {
    const { name, surname, sex, city } = this.state;
    this.setState({ spinning: true });
    const username = this.props.navigation.getParam('phoneNumber');
    let body = {
      city: city.id,
      username,
      sex,
      firstName: name,
      lastName: surname,
      isMaster: false,
    };
    axios
      .post(`${config.url}/api/v1/user`, body)
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
        axios
          .post(`${config.url}/api/v1/auth/login`, { username })
          .then(async (res2) => {
            this.props.login(
              true,
              firstName,
              lastName,
              sex,
              city,
              username,
              id,
              master,
              res2.data.accessToken,
              avatar,
              specializations,
            );

            try {
              let token = 'exited';
              const { status: existingStatus } = await Permissions.getAsync(
                Permissions.NOTIFICATIONS,
              );
              let finalStatus = existingStatus;

              // only ask if permissions have not already been determined, because
              // iOS won't necessarily prompt the user a second time.
              if (existingStatus !== 'granted') {
                // Android remote notification permissions are granted during the app
                // install, so this will only ask on iOS
                const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
                finalStatus = status;
              }

              if (finalStatus === 'granted') {
                token = await Notifications.getExpoPushTokenAsync();
              }

              if (Platform.OS === 'android') {
                //Получаем Push Token для Push Notifications
                Notifications.createChannelAndroidAsync('chat-messages', {
                  name: 'chat-messages',
                  sound: true,
                  vibrate: true,
                });
              }

              axios.post(`${config.url}/api/v1/push/token`, { token, userId: id }).then((res) => {
                axios.post(`${config.url}/api/v1/about-service/${id}/${this.state.fromWhere}`);
                axios
                  .patch(`${config.url}/api/v1/push/token`, { token, userId: id })
                  .then(() => {
                    this.setState({ spinning: false });
                    this.props.navigation.navigate('MyOrders');
                  })
                  .catch(() => {
                    this.setState({ spinning: false, errorModal: true });
                  });
              });
            } catch (error) {
              this.setState({ spinning: false });
            }
          })
          .catch(() => this.setState({ spinning: false }));
      })
      .catch(() => this.setState({ spinning: false }));
  };

  render() {
    const { t } = this.props;
    let disabled = this.state.name.length === 0 || this.state.city === '1'; //city length
    return (
      <ScrollView style={{ flexGrow: 1 }}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" enabled>
          <Container
            style={{
              justifyContent: 'space-between',
              alignItems: 'center',
              flex: 1,
              width: '100%',
              paddingVertical: 30,
            }}
          >
            <View style={styles.container}>
              <Input
                onChangeText={(name) => this.setState({ name })}
                label={() => (
                  <Fragment>
                    <Text allowFontScaling={false} style={styles.inputLabel}>
                      {t('login:name')}
                      <Text allowFontScaling={false} style={{ color: 'red' }}>
                        {' '}
                        *
                      </Text>
                    </Text>
                  </Fragment>
                )}
              />
              <Input
                onChangeText={(surname) => this.setState({ surname })}
                label={() => (
                  <Fragment>
                    <Text allowFontScaling={false} style={styles.inputLabel}>
                      {t('login:surname')}
                    </Text>
                  </Fragment>
                )}
              />
            </View>
            <View style={styles.container}>
              <View style={styles.inputContainer}>
                <Label style={styles.inputLabel}>{t('login:sex')}</Label>
                <Picker
                  headerBackButtonText={t('simple:back')}
                  iosHeader={t('simple:choose')}
                  selectedValue={this.state.sex}
                  onValueChange={(sex) => this.setState({ sex })}
                >
                  <Picker.Item label={t('login:male')} value="M" />
                  <Picker.Item label={t('login:female')} value="F" />
                </Picker>
              </View>
              <View style={styles.inputContainer}>
                <Label style={styles.inputLabel}>
                  {t('login:chooseCity')}
                  <Text allowFontScaling={false} style={{ color: 'red' }}>
                    {' '}
                    *
                  </Text>
                </Label>
                <Picker
                  headerBackButtonText={t('simple:back')}
                  iosHeader={t('simple:choose')}
                  selectedValue={this.state.city}
                  onValueChange={(city) => this.setState({ city })}
                >
                  {this.state.cities.map((city, index) => (
                    <Picker.Item
                      key={index}
                      label={getNamesLocal(city.cityName, city.cityNameKz)}
                      value={city}
                    />
                  ))}
                </Picker>
              </View>
              <View style={styles.inputContainer}>
                <Label style={styles.inputLabel}>{t('login:fromWhere')}</Label>
                <Picker
                  headerBackButtonText={t('simple:back')}
                  iosHeader={t('simple:choose')}
                  selectedValue={this.state.fromWhere}
                  onValueChange={(fromWhere) => this.setState({ fromWhere })}
                >
                  {this.state.aboutServices.map((elem) => {
                    return <Picker.Item label={elem.text} value={elem.id} />;
                  })}
                </Picker>
              </View>
            </View>
            <View style={styles.container}>
              <Text allowFontScaling={false} style={styles.requiredText}>{`* - ${t(
                'login:required',
              )}`}</Text>
            </View>
            <View style={styles.container}>
              {this.state.spinning ? (
                <Spinner spinning={this.state.spinning} color="red" />
              ) : (
                <Button
                  onPress={this.register}
                  disabled={disabled}
                  style={{
                    backgroundColor: disabled ? '#cadadd' : getModeColor('client'),
                    borderRadius: 5,
                  }}
                  block
                  title="Готово"
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
          </Container>
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
    marginVertical: 3,
  },
  inputLabel: {
    fontSize: 16,
    color: '#8b998f',
    marginLeft: 2,
    fontWeight: '500',
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
)(hoistStatics(withTranslation()(RegisterClient), RegisterClient));
