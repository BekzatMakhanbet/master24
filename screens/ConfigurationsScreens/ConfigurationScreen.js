import { Octicons } from '@expo/vector-icons';
import Axios from 'axios';
import { Updates } from 'expo';
import hoistStatics from 'hoist-non-react-statics';
import { ActionSheet, Spinner } from 'native-base';
import React from 'react';
import { withTranslation } from 'react-i18next';
import { Linking, Switch, TouchableOpacity, View } from 'react-native';
import { ListItem } from 'react-native-elements';
import { connect } from 'react-redux';
import { localizationChange } from '../../actions/localActions';
import { switchMode } from '../../actions/modeActions';
import { RestartApp } from '../../components/RestartApp/RestartApp';
import i18n from '../../i18n';
import { store } from '../../store';
import { getModeColor } from '../../utils/getModeColor';
import config from '../../config/config';

const FONT_WEIGHT = 400;
var CANCEL_INDEX = 2;

class ConfigurationScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const { state } = navigation;
    return {
      title: i18n.t('simple:settings'),
      headerLeft: (
        <TouchableOpacity onPress={navigation.openDrawer} style={{ paddingLeft: 10, width: 80 }}>
          <Octicons size={26} name={'three-bars'} color="white" />
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
      clicked: 'hello',
      buttons: ['Қазақша', 'Русский', props.t('settings:close')],
      notification: false,
      modalVisible: false,
      user: undefined,
      spinning: false,
      restartVisible: false,
      buttonIndex: false,
    };
  }
  handleNotification = (value) => {
    this.setState({ spinning: true });
    Axios.put(`${config.url}/api/v1/user/${this.props.authReducer.username}`, {
      pushAllowed: value,
    })
      .then((res) => {
        this.refresh();
      })
      .catch((err) => {
        console.log(err);
      });
  };
  componentDidMount() {
    const { mode } = this.props.modeReducer;

    if (mode !== this.state.mode) {
      this.props.navigation.setParams({ color: getModeColor(mode) });
      this.setState({ mode });
    }
    this.refresh();
  }

  refresh = () => {
    this.setState({ spinning: true });
    Axios.get(`${config.url}/api/v1/user/${this.props.authReducer.username}`).then((res) => {
      this.setState({ user: res.data, spinning: false });
    });
  };

  componentDidUpdate(props) {
    const { mode } = this.props.modeReducer;
    if (mode != this.state.mode) {
      this.props.navigation.setParams({ color: getModeColor(mode) });
      this.setState({ mode });
    }
  }

  /**
   * Go ahead and delete ExpoConfigView and replace it with your content;
   * we just wanted to give you a quick view of your config.
   */
  render() {
    const { t, navigation } = this.props;
    return (
      <View style={{ flex: 1, backgroundColor: '#e9f0f4' }}>
        <View style={{ paddingHorizontal: 10, backgroundColor: 'white' }}>
          <TouchableOpacity
            onPress={() =>
              ActionSheet.show(
                {
                  options: this.state.buttons,
                  cancelButtonIndex: CANCEL_INDEX,
                  title: t('settings:selectTitle'),
                },
                (buttonIndex) => {
                  if (buttonIndex === 0 || buttonIndex === 1) {
                    this.setState({
                      clicked: this.state.buttons[buttonIndex],
                      buttonIndex,
                      restartVisible: true,
                    });
                  }
                },
              )
            }
          >
            <ListItem
              title={t('settings:name')}
              subtitle={t('settings:language')}
              subtitleStyle={{ position: 'absolute', top: 0 }}
              titleStyle={{ fontWeight: `${FONT_WEIGHT}`, marginTop: 35 }}
              bottomDivider
              chevron={{ size: 25, marginTop: 35 }}
            />
          </TouchableOpacity>
          <ListItem
            topDivider
            title={t('settings:getNot')}
            titleStyle={{ fontWeight: `${FONT_WEIGHT}`, marginVertical: 10 }}
            rightElement={
              this.state.user &&
              (this.state.spinning ? (
                <Spinner spinning={this.state.spinning} color="red" />
              ) : (
                <Switch
                  onValueChange={this.handleNotification}
                  value={this.state.user.pushAllowed}
                  thumbColor="#c20021"
                  trackColor="#c20021"
                  style={{ marginVertical: 10 }}
                />
              ))
            }
          />
        </View>
        <View
          style={{
            paddingHorizontal: 10,
            flex: 1,
            marginTop: 20,
            backgroundColor: 'white',
          }}
        >
          <TouchableOpacity>
            <ListItem
              onPress={() => navigation.navigate('AboutApp')}
              title={t('settings:aboutUs')}
              titleStyle={{ fontWeight: `${FONT_WEIGHT}` }}
              bottomDivider
              chevron={{ size: 25 }}
            />
          </TouchableOpacity>
          <TouchableOpacity>
            <ListItem
              onPress={() => Linking.openURL('http://91.201.214.201:4000/privacy_policy')}
              title={t('settings:confidential')}
              titleStyle={{ fontWeight: `${FONT_WEIGHT}` }}
              topDivider
              bottomDivider
              chevron={{ size: 25 }}
            />
          </TouchableOpacity>
          <TouchableOpacity>
            <ListItem
              onPress={() => Linking.openURL('http://91.201.214.201:4000/terms_of_use')}
              title={t('settings:agreement')}
              titleStyle={{ fontWeight: `${FONT_WEIGHT}` }}
              topDivider
              bottomDivider
              chevron={{ size: 25 }}
            />
          </TouchableOpacity>
          <ListItem topDivider />
          <RestartApp
            visibleModal={this.state.restartVisible}
            closeErrorModal={() => this.setState({ restartVisible: false })}
            mode={this.props.modeReducer.mode}
            deleteEntity={() => {
              if (this.state.buttonIndex === 0) {
                this.props.localizationChange('kz');
                i18n.changeLanguage('kz');
                Updates.reload();
              } else if (this.state.buttonIndex === 1) {
                this.props.localizationChange('ru');
                i18n.changeLanguage('ru');
                Updates.reload();
              }
            }}
            title={t('simple:restart')}
            text={t('simple:restartText')}
          />
        </View>
      </View>
    );
  }
}

export default connect(
  ({ modeReducer, localReducer, authReducer }) => ({
    modeReducer,
    localReducer,
    authReducer,
  }),
  { switchMode, localizationChange },
)(hoistStatics(withTranslation()(ConfigurationScreen), ConfigurationScreen));
