import { AntDesign } from '@expo/vector-icons';
import axios from 'axios';
import hoistStatics from 'hoist-non-react-statics';
import { Button, Segment, Spinner, Textarea } from 'native-base';
import React from 'react';
import { withTranslation } from 'react-i18next';
import {
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Header } from 'react-navigation-stack';
import { connect } from 'react-redux';
import { setSpecName } from '../../actions/mastersOrderSpecAction';
import { switchMode } from '../../actions/modeActions';
import i18n from '../../i18n';
import { store } from '../../store';
import { getModeColor } from '../../utils/getModeColor';
import { Linking } from 'expo';
import config from '../../config/config';

const { height } = Dimensions.get('window');

class SendQuestionScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const { state } = navigation;
    return {
      title: i18n.t('simple:support'),
      headerLeft: (
        <TouchableOpacity
          onPress={() => {
            navigation.goBack(null);
          }}
          style={{ paddingLeft: 10 }}
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
    this.state = {
      mode: '',
      spinning: false,
      ordersList: [],
      activePage: 1,
      text: '',
      type: 'QUESTION',
      sending: true,
    };
  }

  componentDidMount() {
    const { mode } = this.props.modeReducer;
    if (mode !== this.state.mode) {
      this.props.navigation.setParams({ color: getModeColor(mode) });
      this.setState({ mode });
    }
  }

  selectComponent = (activePage) => {
    this.setState({ activePage, text: '' });
    if (activePage === 1) {
      this.setState({ type: 'QUESTION' });
    } else if (activePage === 2) {
      this.setState({ type: 'COMPLAINT' });
    } else if (activePage === 3) {
      this.setState({ type: 'SUGGESTION' });
    }
  };

  send = () => {
    const headers = {};
    this.setState({ spinning: true });
    axios
      .post(
        `${config.url}/api/v1/support`,
        {
          text: this.state.text,
          type: this.state.type,
          userId: this.props.authReducer.id,
        },
        { headers },
      )
      .then((res) => {
        this.setState({
          spinning: false,
          sending: false,
        });
      });
  };

  componentDidUpdate(props) {
    const { mode } = this.props.modeReducer;
    if (mode !== this.state.mode) {
      this.props.navigation.setParams({ color: getModeColor(mode) });
      this.setState({ mode });
    }
  }

  render() {
    const { mode } = this.props.modeReducer;
    const color = getModeColor(mode);
    const { activePage } = this.state;
    const { t } = this.props;

    const texts = [
      t('simple:writeQuestion1'),
      t('simple:writeQuestion2'),
      t('simple:writeQuestion3'),
    ];

    return (
      <KeyboardAvoidingView
        style={{
          flex: 1,
          width: '100%',
        }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Header.HEIGHT + 20}
        enabled
      >
        <ScrollView style={{ flex: 1 }}>
          {this.state.sending ? (
            <View
              style={{
                alignItems: 'center',
                minHeight: (height * 88) / 100,
              }}
            >
              <View
                style={{
                  width: '100%',
                  paddingTop: 10,
                  height: '60%',
                }}
              >
                <Text
                  allowFontScaling={false}
                  style={{
                    width: '80%',
                    textAlign: 'center',
                    alignSelf: 'center',
                    fontSize: 15,
                    color: '#999999',
                    fontWeight: '500',
                    marginVertical: 15,
                  }}
                >
                  {t('simple:infoToQuestions')}
                </Text>
                <Segment
                  style={{
                    backgroundColor: '#fff',
                    width: '100%',
                    marginTop: 10,
                  }}
                >
                  <Button
                    large
                    style={{
                      backgroundColor: activePage === 1 ? color : '#e9f0f4',
                      borderColor: 'transparent',
                      width: '33.3%',
                      height: 45,
                    }}
                    active={this.state.activePage === 1}
                    onPress={() => this.selectComponent(1)}
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
                      {t('simple:question1')}
                    </Text>
                  </Button>
                  <Button
                    large
                    style={{
                      backgroundColor: activePage === 2 ? color : '#e9f0f4',
                      borderColor: 'transparent',
                      width: '33.3%',
                      height: 45,
                    }}
                    active={this.state.activePage === 2}
                    onPress={() => this.selectComponent(2)}
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
                      {t('simple:question2')}
                    </Text>
                  </Button>
                  <Button
                    large
                    style={{
                      backgroundColor: activePage === 3 ? color : '#e9f0f4',
                      borderColor: 'transparent',
                      width: '33.3%',
                      height: 45,
                    }}
                    active={this.state.activePage === 3}
                    onPress={() => this.selectComponent(3)}
                  >
                    <Text
                      allowFontScaling={false}
                      style={{
                        color: activePage === 3 ? '#fff' : '#999999',
                        textAlign: 'center',
                        fontWeight: '500',
                        width: '100%',
                      }}
                    >
                      {t('simple:question3')}
                    </Text>
                  </Button>
                </Segment>
                <View style={{ width: '95%', alignSelf: 'center' }}>
                  <Textarea
                    allowFontScaling={false}
                    area
                    rowSpan={4}
                    style={{ marginTop: 15, marginBottom: 10 }}
                    underline
                    onChangeText={(text) => this.setState({ text })}
                    placeholderTextColor="#999999"
                    placeholder={texts[activePage - 1]}
                  />
                  <Text allowFontScaling={false} style={{ color: '#999999', textAlign: 'right' }}>
                    {this.state.text.length}
                  </Text>
                </View>
                <Button
                  onPress={this.send}
                  style={{
                    width: '95%',
                    alignSelf: 'center',
                    backgroundColor: getModeColor(mode),
                    marginTop: 20,
                    alignItems: 'center',
                  }}
                >
                  {this.state.spinning ? (
                    <Spinner color="white" spinning={this.state.spinning} />
                  ) : (
                    <Text
                      allowFontScaling={false}
                      style={{
                        color: '#fff',
                        fontWeight: '500',
                        fontSize: 15,
                        textAlign: 'center',
                        width: '100%',
                      }}
                    >
                      {t('simple:send')}
                    </Text>
                  )}
                </Button>
              </View>
              <View
                style={{
                  width: '100%',
                  height: '5%',
                  marginVertical: 30,
                  backgroundColor: '#e9f0f4',
                }}
              />
              <View
                style={{
                  height: '25%',
                  width: '100%',
                  justifyContent: 'center',
                }}
              >
                <Button
                  style={{
                    width: '95%',
                    alignSelf: 'center',
                    backgroundColor: getModeColor(mode),
                  }}
                  onPress={() => Linking.openURL('tel://87077770316')}
                >
                  <Text
                    allowFontScaling={false}
                    style={{
                      color: '#fff',
                      fontWeight: '500',
                      fontSize: 15,
                      textAlign: 'center',
                      width: '100%',
                    }}
                  >
                    {t('simple:call')}
                  </Text>
                </Button>
                <View
                  style={{
                    width: '95%',
                    alignSelf: 'center',
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginTop: 25,
                  }}
                >
                  <View
                    style={{
                      backgroundColor: '#c20021',
                      padding: 5,
                      borderRadius: 50,
                      marginRight: 10,
                    }}
                  >
                    <AntDesign name="mail" size={18} color="white" />
                  </View>
                  <Text allowFontScaling={false} style={{ fontSize: 15 }}>
                    info@master24.kz
                  </Text>
                </View>
              </View>
              <View style={{ height: 15 }} />
            </View>
          ) : (
            <View
              style={{
                height: (height * 87) / 100,
                width: '100%',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Image
                style={styles.icon}
                source={{
                  uri: 'https://png.pngtree.com/svg/20170516/accept_589598.png',
                }}
              />
              <Text allowFontScaling={false} style={{ fontSize: 19, fontWeight: '600' }}>
                {t('simple:thanksForSend')}
              </Text>
              <Text
                allowFontScaling={false}
                style={{
                  fontSize: 15,
                  width: '80%',
                  textAlign: 'center',
                  fontWeight: '500',
                  marginVertical: 5,
                }}
              >
                {t('simple:thanksForSend2')}
              </Text>
              <Text
                allowFontScaling={false}
                style={{
                  fontSize: 15,
                  width: '80%',
                  textAlign: 'center',
                  fontWeight: '500',
                  marginVertical: 5,
                }}
              >
                {t('simple:thanksForSend3')}
              </Text>
              <Text
                allowFontScaling={false}
                style={{
                  fontSize: 15,
                  width: '80%',
                  textAlign: 'center',
                  fontWeight: '500',
                  marginVertical: 5,
                }}
              >
                {t('simple:thanksForSend4')}
              </Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }
}

export default connect(({ authReducer, modeReducer }) => ({ authReducer, modeReducer }), {
  switchMode,
  setSpecName,
})(hoistStatics(withTranslation()(SendQuestionScreen), SendQuestionScreen));

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  orderContainer: {
    width: '95%',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexDirection: 'row',
    marginVertical: 5,
    paddingHorizontal: 15,
    paddingBottom: 15,
    marginLeft: '2.5%',
    paddingTop: 15,
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
  orderPerson: {
    width: '100%',
    alignItems: 'center',
  },
  specilization: {
    fontWeight: '500',
    fontSize: 14,
  },
  orderText: {
    width: '70%',
    paddingLeft: 12,
  },
  icon: {
    width: 96,
    height: 96,
  },
});
