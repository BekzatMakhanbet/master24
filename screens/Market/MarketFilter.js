/* eslint-disable no-unused-vars */
import { Feather } from '@expo/vector-icons';
import axios from 'axios';
import hoistStatics from 'hoist-non-react-statics';
import React from 'react';
import { withTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { connect } from 'react-redux';
import { localizationChange } from '../../actions/localActions';
import { switchMode } from '../../actions/modeActions';
import i18n from '../../i18n';
import { store } from '../../store';
import { getModeColor } from '../../utils/getModeColor';
import config from '../../config/config';

let arrGlob = [];

class MarketFilters extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const { state } = navigation;

    return {
      title: i18n.t('simple:filtres'),
      headerRight: (
        <TouchableOpacity onPress={() => state.params.handleReady()} style={{ paddingRight: 10 }}>
          <Text style={{ color: 'white', fontWeight: '500', fontSize: 17 }}>
            {i18n.t('simple:ready')}
          </Text>
        </TouchableOpacity>
      ),
      headerLeft: (
        <TouchableOpacity
          onPress={() => navigation.goBack(null)}
          style={{ paddingLeft: 10, width: 80 }}
        >
          <Feather size={26} name={'chevron-left'} color="white" />
        </TouchableOpacity>
      ),
      headerTitleStyle: {
        color: 'white',
        fontWeight: '500',
        fontSize: 17,
      },
      headerStyle: {
        backgroundColor:
          state.params && state.params.color
            ? state.params.color
            : getModeColor(store.getState().modeReducer.mode),
      },
    };
  };
  constructor(props) {
    super(props);
    const filters = this.props.navigation.getParam('filters', []);
    this.state = {
      mode: '',
      clicked: 'hello',
      choosed: filters,
      categories: [],
      collapsed: [],
      specialization: [],
      markets: [],
      modalVisible: false,
    };
  }
  componentDidMount() {
    const { token, specializations, city } = this.props.authReducer;

    let specs = '';
    if (specializations) {
      for (let i = 0; i < specializations.length; i++) {
        specs += `specs=${specializations[i].id}&`;
      }
      specs = specs.substring(0, specs.lastIndexOf('&'));
    }

    axios
      .get(`${config.url}/api/v1/market/specialization?${specs}&cityId=${city.id}`)
      .then((res) => {
        let newArray = [];
        let uniqueObject = {};
        for (let i in res.data.markets) {
          // Extract the title
          const objTitle = res.data.markets[i].industry;

          // Use the title as the index
          uniqueObject[objTitle] = res.data.markets[i];
        }

        for (let i in uniqueObject) {
          newArray.push(uniqueObject[i]);
        }

        this.setState({
          markets: newArray,
        });
      });

    const { mode } = this.props.modeReducer;
    this.props.navigation.setParams({
      handleReady: () => this.handleReady(),
    });

    if (mode !== this.state.mode) {
      this.props.navigation.setParams({ color: getModeColor(mode) });
      this.setState({ mode });
    }
  }

  handleReady = () => {
    const specListToSend = this.state.choosed.filter((el) => el !== 'deleted');

    this.props.navigation.navigate('Settings', { filter: specListToSend });
  };

  componentDidUpdate(props) {
    const { mode } = this.props.modeReducer;
    if (mode !== this.state.mode) {
      this.props.navigation.setParams({ color: getModeColor(mode) });
      this.setState({ mode });
    }
  }

  updateSearch = (search) => {
    this.setState({ search });
  };

  collapse = (index) => {
    let arr = this.state.collapsed;
    arr[index] = true;
    this.setState({ collapsed: arr });
  };

  choose = (index) => {
    const arr = this.state.choosed;
    if (arr.includes(index)) {
      arr[arr.indexOf(index)] = 'deleted';
    } else {
      arr.push(index);
    }
    this.setState({ choosed: arr });
    arrGlob = arr;
  };

  unCollapse = (index) => {
    let arr = this.state.collapsed;
    arr[index] = false;
    this.setState({ collapsed: arr });
  };

  setModalVisible = (value) => {
    this.setState({ modalVisible: value });
  };

  render() {
    const { markets } = this.state;
    return (
      <View style={styles.container}>
        <ScrollView style={{ width: '100%' }} contentContainerStyle={{ alignItems: 'center' }}>
          <View style={styles.containerForCategories}>
            {markets.map((market, index) => (
              <Text
                onPress={() => this.choose(market.industry)}
                style={[
                  styles.specs,
                  this.state.choosed.includes(market.industry) && {
                    backgroundColor: '#e9f0f4',
                  },
                ]}
                key={index}
              >
                {market.industry}
              </Text>
            ))}
          </View>
        </ScrollView>
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
  questionTitle: {
    fontSize: 19,
    fontWeight: '500',
    width: '80%',
    alignSelf: 'center',
    textAlign: 'center',
    paddingVertical: 15,
  },
  searchcontainer: {
    width: '90%',
    backgroundColor: 'white',
    paddingLeft: 0,
    paddingRight: 0,
    borderWidth: 0, //no effect
    shadowColor: 'white', //no effect
    borderBottomColor: 'transparent',
    borderTopColor: 'transparent',
  },
  containerForCategories: {
    marginTop: 20,
    width: '90%',
    textAlign: 'left',
  },
  categoryWrapper: {
    paddingBottom: 10,
    borderBottomColor: '#e9f0f4',
    borderBottomWidth: 2,
    marginVertical: 7,
  },
  categoryText: {
    fontWeight: '500',
    fontSize: 17,
  },
  categoriesLeftPart: {
    width: '65%',
  },
  specs: {
    color: '#999999',
    marginVertical: 5,
    fontSize: 16,
    paddingLeft: 4,
    borderRadius: 5,
  },
  more: {
    color: '#c20021',
    fontWeight: '500',
    fontSize: 16,
    textAlign: 'center',
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
    backgroundColor: '#c20021',
    width: '100%',
    alignItems: 'center',
    textAlign: 'center',
    marginVertical: 5,
  },
});

export default connect(
  ({ authReducer, modeReducer, localReducer }) => ({
    authReducer,
    modeReducer,
    localReducer,
  }),
  { switchMode, localizationChange },
)(hoistStatics(withTranslation()(MarketFilters), MarketFilters));
