import { AntDesign } from '@expo/vector-icons';
import hoistStatics from 'hoist-non-react-statics';
import React from 'react';
import { withTranslation } from 'react-i18next';
import { TouchableOpacity, View } from 'react-native';
import { connect } from 'react-redux';
import { localizationChange } from '../../actions/localActions';
import { switchMode } from '../../actions/modeActions';
import AboutAppGuide from '../../components/Guides/AboutAppGuide';
import i18n from '../../i18n';
import { store } from '../../store';
import { getModeColor } from '../../utils/getModeColor';

class AboutApp extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const { state } = navigation;
    return {
      title: i18n.t('simple:aboutApp'),
      headerLeft: (
        <TouchableOpacity
          onPress={() => navigation.goBack(null)}
          style={{ paddingLeft: 10, width: 80 }}
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
      modalVisible: false,
    };
  }
  componentDidMount() {
    const { mode } = this.props.modeReducer;
    console.log('mode', mode);

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

  render() {
    return (
      <View style={{ flex: 1 }}>
        <AboutAppGuide />
      </View>
    );
  }
}

export default connect(({ modeReducer, localReducer }) => ({ modeReducer, localReducer }), {
  switchMode,
  localizationChange,
})(hoistStatics(withTranslation()(AboutApp), AboutApp));
