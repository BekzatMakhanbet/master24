import axios from 'axios';
import { Linking, Notifications } from 'expo';
import * as Permissions from 'expo-permissions';
import hoistStatics from 'hoist-non-react-statics';
import { Button, Container, Content, Form, Input, Item, Spinner } from 'native-base';
import React, { Fragment } from 'react';
import { withTranslation } from 'react-i18next';
import { Image, Keyboard, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { connect } from 'react-redux';
import { login, logout } from '../../actions/authActions';
import { localizationChange } from '../../actions/localActions';
import { switchMode } from '../../actions/modeActions';
import { BlockedAccountModal } from '../../components/ModalComponents/BlockedAccountModal';
import { ErrorModal } from '../../components/ModalComponents/ErrorModal';
import { getModeColor } from '../../utils/getModeColor';
import config from '../../config/config';

class LogInClient extends React.Component {
  static navigationOptions = ({ navigation }) => {
    let { state } = navigation;
    return {
      title: state.params && state.params.title,
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
      mode: '',
      title: 'Вход',
      placeholder: '+7 (_ _ _ ) -_ _ _ - _ _ - _ _',
      code: '',
      phoneNumber: '',
      disabled: true,
      phoneMode: true,
      smsCode: '',
      uncorrectCode: false,
      spinning: false,
      errorModal: false,
      blockedAcc: false,
      errorText: '',
    };
  }

  componentDidMount() {
    this.props.navigation.setParams({ title: this.props.t('login:signIn') });

    this.props.logout();

    if (this.props.modeReducer.mode === 'master') {
      this.props.switchMode();
    }
  }

  componentDidUpdate() {
    if (this.state.title !== this.props.t('login:signIn')) {
      this.props.navigation.setParams({ title: this.props.t('login:signIn') });
      this.setState({ title: this.props.t('login:signIn') });
    }

    if (this.props.modeReducer.mode === 'master') {
      this.props.switchMode();
    }
  }

  sendCodeMessage = () => {
    let { phoneNumber } = this.state;
    this.setState({ spinning: true });
    if (phoneNumber === '7777777777') {
      this.setState({ phoneMode: false, spinning: false });
    } else {
      axios
        .post(`${config.url}/api/v1/auth/${phoneNumber}/code`)
        .then((res) => {
          this.setState({ phoneMode: false, spinning: false });
        })
        .catch((err) => {
          console.log(err);
          this.setState({ spinning: false, errorModal: true });
        });
    }
  };

  auth = () => {
    let { phoneNumber } = this.state;

    axios
      .get(`${config.url}/api/v1/user/${phoneNumber}`)
      .then(async (res) => {
        const {
          city,
          firstName,
          lastName,
          master,
          username,
          id,
          sex,
          avatar,
          status,
          specializations,
        } = res.data;

        if (status === 'BLOCKED') {
          this.setState({ blockedAcc: true, spinning: false });
        } else {
          this.props.login(
            true,
            firstName,
            lastName,
            sex,
            city,
            username,
            id,
            master,
            '',
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

            console.log(token);

            axios.post(`${config.url}/api/v1/push/token`, { token, userId: id }).then(() => {
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
            this.setState({ spinning: false, errorModal: true });
          }
        }
      })
      .catch((err) => {
        console.log(err);

        this.setState({ errorText: JSON.stringify(err) });
        this.props.navigation.navigate('RegisterClient', {
          phoneNumber,
        });
      });
  };

  checkSmsCode = () => {
    let { phoneNumber, code } = this.state;
    const username = phoneNumber;
    this.setState({ spinning: true });
    axios
      .get(`${config.url}/api/v1/auth/code/verify?code=${code}&&username=${username}`)
      .then((res) => {
        if (res.data === true) {
          this.auth();
        } else if (res.data === false) {
          this.setState({ uncorrectCode: true, spinning: false });
          console.log('Неправильный код');
        }
      })
      .catch(() => {
        this.setState({ spinning: false, errorModal: true });
      });
  };

  onChangePhoneNumber = (value) => {
    const { length } = value;
    if (length <= 10) {
      this.setState({ phoneNumber: value });
      this.setState({ disabled: true });
    }
    if (length === 10) {
      this.setState({ disabled: false });
      Keyboard.dismiss();
    }
  };

  onChangeCode = (val) => {
    if (val.length <= 4) {
      this.setState({ code: val }, () => {
        if (this.state.code.length === 4) {
          Keyboard.dismiss();
          this.checkSmsCode();
        }
      });
    }
  };

  render() {
    const { t } = this.props;
    const { mode } = this.props.modeReducer;
    const { locale } = this.props.localReducer;

    return (
      <Container style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
        <Content
          contentContainerStyle={{
            width: '90%',
            marginTop: 65,
            justifyContent: 'center',
            alignItems: 'center',
            alignSelf: 'center',
          }}
        >
          {this.state.phoneMode && (
            <Fragment>
              <Text allowFontScaling={false} style={styles.enterText}>
                {t('login:enterPhoneNumber')}
              </Text>
              <Form style={{ justifyContent: 'center', alignItems: 'center' }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    width: '95%',
                    justifyContent: 'center',
                  }}
                >
                  <Image
                    source={require('../../assets/images/kazakhstan-flag-icon-32.png')}
                    fadeDuration={0}
                    style={{
                      width: 35,
                      height: 25,
                      borderRadius: 3,
                      marginRight: 5,
                    }}
                  />
                  <Text allowFontScaling={false} style={{ fontSize: 17, marginRight: 3 }}>
                    +7
                  </Text>

                  <Input
                    keyboardType="numeric"
                    onChangeText={(val) => this.onChangePhoneNumber(val)}
                    value={this.state.phoneNumber}
                    style={{
                      textAlign: 'left',
                      borderBottomWidth: 1,
                      borderBottomColor: '#999999',
                    }}
                    placeholder={t('login:yourPhoneNumber')}
                  />
                </View>

                <Text
                  onPress={() => Linking.openURL('http://91.201.214.201:4000/terms_of_use')}
                  allowFontScaling={false}
                  style={styles.aggreementText}
                >
                  {locale === 'ru' ? (
                    <>
                      <Text>Нажимая кнопку "Войти" Вы принимаете условия </Text>
                      <Text style={styles.blueText}>Пользовательского соглашения</Text>
                    </>
                  ) : (
                    <>
                      <Text>«Кіру» түймесін басу арқылы Сіз </Text>
                      <Text style={styles.blueText}>Пайдаланушы келісімінің шарттарын</Text>
                      <Text> қабылдайсыз</Text>
                    </>
                  )}
                </Text>
              </Form>
              {this.state.spinning ? (
                <Spinner color="red" />
              ) : (
                <Button
                  onPress={this.sendCodeMessage}
                  disabled={this.state.disabled}
                  style={{
                    backgroundColor: this.state.disabled ? '#cadadd' : getModeColor(mode),
                    borderRadius: 5,
                  }}
                  block
                >
                  <Text
                    allowFontScaling={false}
                    style={{ color: 'white', fontSize: 15, fontWeight: '500' }}
                  >
                    {t('login:login')}
                  </Text>
                </Button>
              )}
            </Fragment>
          )}
          {this.state.phoneMode || (
            <Fragment>
              <Text allowFontScaling={false} style={styles.enterText}>
                {t('login:enterCode')}
              </Text>
              <Text allowFontScaling={false} style={{ color: '#999999', textAlign: 'center' }}>
                {t('login:enterCodeText') + this.state.phoneNumber}
              </Text>
              <Form
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginTop: 10,
                }}
              >
                <Item style={{ textAlign: 'center' }}>
                  <Input
                    keyboardType="numeric"
                    onChangeText={(val) => this.onChangeCode(val)}
                    value={this.state.code}
                    style={[
                      { textAlign: 'center', fontSize: 18 },
                      this.state.code.length && { letterSpacing: 5 },
                    ]}
                    placeholder={t('login:enterCode')}
                  />
                </Item>
              </Form>
              {this.state.uncorrectCode && (
                <View>
                  <Text allowFontScaling={false} style={styles.uncorrectNumber}>
                    {t('login:uncorrectCodeTryAgain')}
                  </Text>
                </View>
              )}
              {this.state.spinning && <Spinner color="red" />}
              <TouchableOpacity onPress={() => this.setState({ phoneMode: true })}>
                <Text allowFontScaling={false} style={styles.uncorrectNumber}>
                  {t('login:uncorrectNumber') + '?'}
                </Text>
              </TouchableOpacity>
            </Fragment>
          )}
          <ErrorModal
            visibleModal={this.state.errorModal}
            closeErrorModal={() => this.setState({ errorModal: false })}
          />
          <BlockedAccountModal
            visibleModal={this.state.blockedAcc}
            closeErrorModal={() => this.setState({ blockedAcc: false })}
          />
        </Content>
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  blueText: {
    color: '#0645AD',
  },
  enterText: {
    fontWeight: '500',
    fontSize: 20,
    marginBottom: 20,
    maxWidth: '90%',
    textAlign: 'center',
  },
  aggreementText: {
    color: '#999999',
    textAlign: 'center',
    paddingVertical: 30,
  },
  uncorrectNumber: {
    textAlign: 'center',
    color: '#c20021',
    paddingVertical: 15,
    fontSize: 16,
  },
});

export default connect(
  ({ modeReducer, localReducer, authReducer }) => ({
    modeReducer,
    localReducer,
    authReducer,
  }),
  { switchMode, localizationChange, login, logout },
)(hoistStatics(withTranslation()(LogInClient), LogInClient));
