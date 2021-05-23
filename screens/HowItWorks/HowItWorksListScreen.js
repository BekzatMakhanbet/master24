import { Octicons } from '@expo/vector-icons';
import axios from 'axios';
import hoistStatics from 'hoist-non-react-statics';
import { Button, Spinner } from 'native-base';
import React from 'react';
import { withTranslation } from 'react-i18next';
import {
  Dimensions,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { connect } from 'react-redux';
import { setSpecName } from '../../actions/mastersOrderSpecAction';
import { switchMode } from '../../actions/modeActions';
import i18n from '../../i18n';
import { store } from '../../store';
import { getModeColor } from '../../utils/getModeColor';
import getNamesLocal from '../../utils/getNamesLocal';
import config from '../../config/config';

const { height } = Dimensions.get('window');

class HowItWorksScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const { state } = navigation;
    return {
      title: i18n.t('menu:howItWorks'),
      headerLeft: (
        <TouchableOpacity onPress={navigation.openDrawer} style={{ paddingLeft: 10 }}>
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
      spinning: false,
      list: [],
    };
  }

  componentDidMount() {
    this.refresh();
    this.setState({ spinning: true });
    const { mode } = this.props.modeReducer;
    if (mode !== this.state.mode) {
      this.props.navigation.setParams({ color: getModeColor(mode) });
      this.setState({ mode });
    }
  }

  refresh = () => {
    const headers = {};
    axios
      .get(`${config.url}/api/v1/faq-category`, {
        headers,
      })
      .then((res) => {
        this.setState({ spinning: false });
        this.setState({ list: res.data.sort((a, b) => a.id > b.id) });
      })
      .catch((err) => {
        console.log(err);
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
    const { t } = this.props;

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
          <View
            style={{
              alignItems: 'center',
              minHeight: (height * 4) / 5,
            }}
          >
            <View
              style={{
                width: '100%',
                paddingTop: 10,
              }}
            >
              {this.state.spinning ? (
                <Spinner color="red" />
              ) : this.state.list.length > 0 ? (
                <FlatList
                  data={this.state.list}
                  renderItem={({ item, index }) => {
                    return (
                      <View key={`${index}`}>
                        <View style={styles.categoryContainer}>
                          <View>
                            <Text allowFontScaling={false} style={styles.categoryTitle}>
                              {getNamesLocal(item.name, item.nameKz)}
                            </Text>
                          </View>
                          {item.faqs
                            .sort((a, b) => a.id > b.id)
                            .map((faq) => (
                              <TouchableOpacity
                                onPress={() => this.props.navigation.navigate('FAQ', { faq })}
                              >
                                <Text allowFontScaling={false} style={styles.categoryFaqs}>
                                  {getNamesLocal(faq.title, faq.titleKz)}
                                </Text>
                              </TouchableOpacity>
                            ))}
                        </View>
                      </View>
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
                    {t('simple:noQuestions')}
                  </Text>
                </View>
              )}
            </View>
          </View>
          <Button
            style={{
              justifySelf: 'flex-end',
              width: '95%',
              alignSelf: 'center',
              backgroundColor: getModeColor(mode),
            }}
            onPress={() => this.props.navigation.navigate('SendQuestion')}
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
              {t('simple:writeToMaster24')}
            </Text>
          </Button>
          <View style={{ height: 15 }} />
        </ScrollView>
      </View>
    );
  }
}

export default connect(({ authReducer, modeReducer }) => ({ authReducer, modeReducer }), {
  switchMode,
  setSpecName,
})(hoistStatics(withTranslation()(HowItWorksScreen), HowItWorksScreen));

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  categoryTitle: {
    fontWeight: '600',
    fontSize: 18,
    color: 'black',
    marginVertical: 10,
  },
  categoryFaqs: {
    fontSize: 16,
    color: '#999999',
    marginVertical: 5,
  },
  categoryContainer: {
    width: '90%',
    alignSelf: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#999999',
    paddingVertical: 20,
    paddingHorizontal: 5,
  },
});
