import { Octicons } from '@expo/vector-icons';
import axios from 'axios';
import hoistStatics from 'hoist-non-react-statics';
import { Spinner } from 'native-base';
import React from 'react';
import { withTranslation } from 'react-i18next';
import {
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { connect } from 'react-redux';
import { setSpecName } from '../../actions/mastersOrderSpecAction';
import { switchMode } from '../../actions/modeActions';
import i18n from '../../i18n';
import { store } from '../../store';
import getFontSize from '../../utils/getFontSize';
import { getModeColor } from '../../utils/getModeColor';
import increaseViewCount from '../../utils/increaseViewCount';
import config from '../../config/config';

class PromosListMaster extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const { state } = navigation;
    return {
      title: i18n.t('simple:promos'),
      headerLeft: (
        <TouchableOpacity onPress={navigation.openDrawer} style={{ paddingLeft: 10 }}>
          <Octicons size={getFontSize(26)} name={'three-bars'} color="white" />
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
      spinning: true,
      promos: [],
    };
  }

  componentDidMount() {
    this.refresh();
    const { mode } = this.props.modeReducer;
    if (mode != this.state.mode) {
      this.props.navigation.setParams({ color: getModeColor(mode) });
      this.setState({ mode });
    }
  }

  refresh = () => {
    const { specializations } = this.props.authReducer;

    let specsPromo = '';
    if (specializations) {
      for (let i = 0; i < specializations.length; i++) {
        specsPromo += `specIds=${specializations[i].id}&`;
      }
      specsPromo = specsPromo.substring(0, specsPromo.lastIndexOf('&'));
    }

    axios
      .get(
        `${config.url}/api/v1/promo/spec?displayType=MASTER&${specsPromo}&city=${this.props.authReducer.city.id}`,
      )
      .then((res) => {
        this.setState({ spinning: false });
        // const result = res.data.filter((item) => item.type === "MARKET");
        this.setState({ promos: res.data });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  componentDidUpdate(props) {
    const { mode } = this.props.modeReducer;
    if (mode != this.state.mode) {
      if (mode === 'client') {
        this.props.navigation.navigate({
          routeName: 'MyOrders',
        });
      }
      this.props.navigation.setParams({ color: getModeColor(mode) });
      this.setState({ mode });
    }
  }

  render() {
    const { navigate } = this.props.navigation;

    return this.state.spinning ? (
      <Spinner color="red" />
    ) : (
      <View style={{ flex: 1 }}>
        <ScrollView
          refreshControl={
            <RefreshControl
              //refresh control used for the Pull to Refresh
              refreshing={this.state.spinning}
              onRefresh={this.refresh}
            />
          }
        >
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <View
              style={{
                width: '100%',
                justifyContent: 'center',
                paddingTop: 10,
              }}
            >
              {this.state.spinning ? (
                <Spinner color="red" />
              ) : this.state.promos.length > 0 ? (
                <FlatList
                  data={this.state.promos}
                  renderItem={({ item, index }) => {
                    return (
                      <FlatListItem
                        item={item}
                        navigate={navigate}
                        index={index}
                        navigation={this.props.navigation}
                      />
                    );
                  }}
                  keyExtractor={(item) => item.id + ''}
                />
              ) : (
                <View
                  style={{
                    width: '90%',
                    height: 240,
                    alignSelf: 'center',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Text
                    allowFontScaling={false}
                    style={{
                      fontSize: 16,
                      fontWeight: '500',
                      marginVertical: 20,
                      color: '#999999',
                    }}
                  >
                    {this.props.t('simple:noPromos')}
                  </Text>
                </View>
              )}
            </View>
          </View>
          <View style={{ height: 70 }} />
        </ScrollView>
      </View>
    );
  }
}

class FlatListItem extends React.Component {
  navigate = () => {
    const { item: promo, navigation } = this.props;
    if (promo.marketId) {
      increaseViewCount('BANNER_FOLLOW', promo.id);

      navigation.navigate('MarketMain', {
        marketId: promo.marketId,
      });
    }
  };

  render() {
    const { item } = this.props;
    return (
      <TouchableWithoutFeedback
        style={{ width: '100%', alignItems: 'center', alignSelf: 'center' }}
        onPress={this.navigate}
      >
        <Image
          style={styles.image}
          source={{
            uri: item.image ? `${config.url}/images/${item.image.imageName}` : config.defaultImage,
          }}
          resizeMode="contain"
        />
      </TouchableWithoutFeedback>
    );
  }
}

export default connect(({ authReducer, modeReducer }) => ({ authReducer, modeReducer }), {
  switchMode,
  setSpecName,
})(hoistStatics(withTranslation()(PromosListMaster), PromosListMaster));

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    width: '95%',
    alignItems: 'center',
    height: getFontSize(250),
    marginVertical: 10,
    borderRadius: 10,
  },
});
