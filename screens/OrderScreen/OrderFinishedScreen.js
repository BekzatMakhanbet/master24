import hoistStatics from 'hoist-non-react-statics';
import { Button, Text } from 'native-base';
import React from 'react';
import { withTranslation } from 'react-i18next';
import { Image, StyleSheet, View } from 'react-native';
import { NavigationActions, StackActions } from 'react-navigation';
import { connect } from 'react-redux';
import { localizationChange } from '../../actions/localActions';
import { switchMode } from '../../actions/modeActions';
import { getModeColor } from '../../utils/getModeColor';

class OrderFinished extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const { state } = navigation;
    return {
      header: null,
    };
  };
  constructor(props) {
    super(props);
    this.state = {
      mode: '',
      clicked: 'hello',
    };
  }
  componentDidMount() {
    const { mode } = this.props.modeReducer;
    if (mode != this.state.mode) {
      this.props.navigation.setParams({ color: getModeColor(mode) });
      this.setState({ mode });
    }
  }

  componentDidUpdate(props) {
    const { mode } = this.props.modeReducer;
    if (mode != this.state.mode) {
      this.props.navigation.setParams({ color: getModeColor(mode) });
      this.setState({ mode });
    }
  }

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

    return (
      <View style={styles.container}>
        <View
          style={{
            width: '100%',
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            paddingBottom: 20,
          }}
        >
          <View
            style={{
              width: '80%',
              paddingVertical: 20,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Image
              style={styles.icon}
              source={{
                uri: 'https://png.pngtree.com/svg/20170516/accept_589598.png',
              }}
            />
            <Text allowFontScaling={false} style={styles.titleText}>
              {t('createOrder:orderCreated')}
            </Text>
            <Text allowFontScaling={false} style={styles.describeText}>
              {t('createOrder:orderCreatedBottomText')}
            </Text>
            <Text allowFontScaling={false} style={styles.describeText}>
              {t('createOrder:orderCreatedBottomText2')}
            </Text>
            <Button onPress={this.finish} style={styles.button}>
              <Text
                allowFontScaling={false}
                style={{
                  width: '100%',
                  color: '#fff',
                  textTransform: 'capitalize',
                  textAlign: 'center',
                  fontSize: 17,
                }}
              >
                {t('createOrder:goToOrder')}
              </Text>
            </Button>
          </View>
        </View>
      </View>
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
    fontSize: 21,
    marginVertical: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  describeText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  buttonText: {
    color: '#c20021',
    fontSize: 13,
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#c20021',
    width: '100%',
    alignItems: 'center',
    textAlign: 'center',
    marginVertical: 20,
  },
  icon: {
    width: 96,
    height: 96,
  },
});

export default connect(({ modeReducer, localReducer }) => ({ modeReducer, localReducer }), {
  switchMode,
  localizationChange,
})(hoistStatics(withTranslation()(OrderFinished), OrderFinished));
