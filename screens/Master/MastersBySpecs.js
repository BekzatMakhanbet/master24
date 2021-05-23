import { AntDesign, Octicons } from '@expo/vector-icons';
import axios from 'axios';
import hoistStatics from 'hoist-non-react-statics';
import { Badge, Spinner } from 'native-base';
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
import { Avatar } from 'react-native-elements';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { connect } from 'react-redux';
import { setSpecName } from '../../actions/mastersOrderSpecAction';
import { switchMode } from '../../actions/modeActions';
import i18n from '../../i18n';
import { store } from '../../store';
import getLastOnline from '../../utils/getLastOnline';
import { getModeColor } from '../../utils/getModeColor';
import getUserDuration from '../../utils/getUserDuration';
import getUserRating from '../../utils/getUserRating';
import config from '../../config/config';

class MastersBySpecs extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const { state } = navigation;
    return {
      title: i18n.t('simple:masters'),
      headerLeft: (
        <TouchableOpacity onPress={navigation.openDrawer} style={{ paddingLeft: 10, width: 80 }}>
          <Octicons size={26} name={'three-bars'} color="white" />
        </TouchableOpacity>
      ),
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
    const { specialization } = props.navigation.dangerouslyGetParent().getParam('item', 0);
    this.state = {
      refreshing: false,
      mode: '',
      masters: [],
      specialization,
    };
  }

  componentDidMount() {
    this.refresh();
    this.setState({ refreshing: true });
    const { mode } = this.props.modeReducer;
    if (mode != this.state.mode) {
      this.props.navigation.setParams({ color: getModeColor(mode) });
      this.setState({ mode });
    }
  }

  refresh = () => {
    const { city } = this.props.authReducer;
    console.log('master id', this.props.mastersOrderSpec.specId);

    axios
      .get(
        `${config.url}/api/v1/user/masters/${
          this.state.specialization
            ? this.state.specialization.id
            : this.props.mastersOrderSpec.specId
        }`,
      )
      .then((res) => {
        this.setState(
          {
            refreshing: false,
            masters: res.data.users.filter((user) => user.city.id === city.id),
          },
          () => {
            const { tabBarStatus, specId, marketCount } = this.props.mastersOrderSpec;

            this.props.setSpecName(tabBarStatus, this.state.masters.length, marketCount, specId);
          },
        );
      });
  };

  componentDidUpdate(props) {
    const { mode } = this.props.modeReducer;
    if (mode != this.state.mode) {
      this.props.navigation.setParams({ color: getModeColor(mode) });
      this.setState({ mode });
    }
  }

  componentWillReceiveProps(props) {
    if (props.navigation.dangerouslyGetParent()) {
      console.log(this.props.navigation.dangerouslyGetParent().getParam('itemId', 0));
    }
  }

  render() {
    const { navigate } = this.props.navigation;
    const { t } = this.props;
    return (
      <View>
        <ScrollView
          refreshControl={
            <RefreshControl
              //refresh control used for the Pull to Refresh
              refreshing={this.state.refreshing}
              onRefresh={this.refresh}
            />
          }
        >
          <View style={{ width: '100%', justifyContent: 'center', paddingTop: 10 }}>
            {this.state.spinning ? (
              <Spinner color="red" />
            ) : this.state.masters.length > 0 ? (
              <FlatList
                data={this.state.masters}
                renderItem={({ item, index }) => {
                  return <FlatListItem item={item} navigate={navigate} index={index} t={t} />;
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
                    textAlign: 'center',
                    fontSize: 16,
                    fontWeight: '500',
                    marginVertical: 20,
                    color: '#999999',
                  }}
                >
                  {t('simple:noMastersAtThisMoment')}
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    );
  }
}

class FlatListItem extends React.Component {
  render() {
    const { item, t } = this.props;
    const onlineStatus = getLastOnline(item.lastRequest);

    return (
      item.status !== 'BLOCKED' && (
        <TouchableWithoutFeedback
          onPress={() => {
            this.props.navigate('MasterProfileForClientBySpec', { user: item });
          }}
        >
          <View style={{ flex: 1 }}>
            <View style={styles.orderContainer}>
              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <View style={styles.orderPerson}>
                  <Avatar
                    rounded
                    size="large"
                    icon={{ name: 'user', type: 'font-awesome' }}
                    activeOpacity={0.7}
                    source={{
                      uri: item.avatar
                        ? `${config.url}/images/${item.avatar.imageName}`
                        : 'https://media.istockphoto.com/photos/icon-of-a-businessman-avatar-or-profile-pic-picture-id474001892?k=6&m=474001892&s=612x612&w=0&h=6g0M3Q3HF8_uMQpYbkM9XAAoEDym7z9leencMcC4pxo=',
                    }}
                  />
                </View>
              </View>
              <View style={styles.orderText}>
                <Text
                  allowFontScaling={false}
                  style={{
                    color: 'black',
                    fontWeight: '500',
                    fontSize: 16,
                  }}
                >
                  {item.firstName} {item.lastName}
                </Text>
                <View>
                  {onlineStatus === 'online' ? (
                    <Badge style={{ height: 20, marginBottom: 3 }} success>
                      <Text allowFontScaling={false} style={{ color: '#fff' }}>
                        {onlineStatus}
                      </Text>
                    </Badge>
                  ) : (
                    <Text allowFontScaling={false} style={{ color: '#999999' }}>
                      {onlineStatus}
                    </Text>
                  )}
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ flexDirection: 'row' }}>
                      <AntDesign
                        name="star"
                        size={19}
                        color={item.rating > 20 ? '#c20021' : '#999999'}
                      />
                      <Text allowFontScaling={false} style={styles.specilization}>
                        {item.rating > 0 ? '+' : ''} {item.rating}{' '}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row' }}>
                      <Text allowFontScaling={false} style={styles.bottomGreyTexts}>
                        | {getUserRating(item.rating)}{' '}
                      </Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Image
                      source={
                        item.status == 'VERIFIED'
                          ? require('../../assets/images/checked.png')
                          : require('../../assets/images/unchecked.png')
                      }
                      style={{
                        width: 16,
                        height: 18,
                        marginLeft: 1,
                      }}
                    />
                    <Text
                      allowFontScaling={false}
                      style={[
                        styles.bottomGreyTexts,
                        {
                          marginTop: 2,
                          borderLeftColor: '#c1c3c7',
                          borderLeftWidth: 1,
                          paddingLeft: 5,
                          marginLeft: 3,
                        },
                      ]}
                    >
                      {t(`profile:${item.status}`)}{' '}
                    </Text>
                  </View>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginVertical: 5,
                  }}
                >
                  <Text allowFontScaling={false} style={styles.bottomGreyTexts}>
                    {getUserDuration(item.created)}
                  </Text>
                </View>
                <Text allowFontScaling={false} style={styles.bottomGreyTexts}>
                  {t('order:finishedOrders')}:{' '}
                  <Text allowFontScaling={false} style={{ fontWeight: '500', color: 'black' }}>
                    {item.masterOrderCount}
                  </Text>
                </Text>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      )
    );
  }
}

export default connect(
  ({ authReducer, modeReducer, mastersOrderSpec }) => ({
    authReducer,
    modeReducer,
    mastersOrderSpec,
  }),
  { switchMode, setSpecName },
)(hoistStatics(withTranslation()(MastersBySpecs), MastersBySpecs));

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  orderPerson: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  specilization: {
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 19,
  },
  orderText: {
    width: '73%',
    paddingLeft: 7,
  },
  orderContainer: {
    width: '95%',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexDirection: 'row',
    marginVertical: 5,
    paddingHorizontal: 10,
    paddingBottom: 10,
    marginLeft: '2.5%',
    paddingTop: 10,
    borderWidth: 2.5,
    borderColor: '#c20021',
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  bottomGreyTexts: {
    fontSize: 13,
    color: '#999999',
    lineHeight: 15,
  },
});
