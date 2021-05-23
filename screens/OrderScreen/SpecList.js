import { Entypo, Feather } from '@expo/vector-icons';
import axios from 'axios';
import hoistStatics from 'hoist-non-react-statics';
import React from 'react';
import { withTranslation } from 'react-i18next';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NavigationActions, StackActions } from 'react-navigation';
import { connect } from 'react-redux';
import { localizationChange } from '../../actions/localActions';
import { switchMode } from '../../actions/modeActions';
import i18n from '../../i18n';
import { getModeColor } from '../../utils/getModeColor';
import getNamesLocal from '../../utils/getNamesLocal';
import config from '../../config/config';

let arrGlob = [];

class OneSpecList extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: i18n.t('simple:specs'),
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
        backgroundColor: '#c20021',
      },
    };
  };
  constructor(props) {
    super(props);
    this.state = {
      mode: '',
      clicked: 'hello',
      choosed: [],
      categories: [],
      collapsed: [],
      specialization: [],
      images: [],
      modalVisible: false,
    };
  }
  componentDidMount() {
    const headers = {};

    axios.get(`${config.url}/api/v1/category`, { headers }).then((res) => {
      const collapsedArray = [];
      for (let i = 0; i < res.data.categories.length; i++) {
        collapsedArray.push(false);
      }
      this.setState({
        categories: res.data.categories,
        collapsed: collapsedArray,
      });
    });

    const { mode } = this.props.modeReducer;
    this.props.navigation.setParams({
      handleClose: () => this.setModalVisible(true),
    });

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

  updateSearch = (search) => {
    this.setState({ search });
  };

  collapse = (index) => {
    let arr = this.state.collapsed;
    arr[index] = true;
    this.setState({ collapsed: arr });
  };

  choose = (index) => {
    this.props.navigation.navigate('EditOrder', { spec: index });
  };

  unCollapse = (index) => {
    let arr = this.state.collapsed;
    arr[index] = false;
    this.setState({ collapsed: arr });
  };

  setModalVisible = (value) => {
    this.setState({ modalVisible: value });
  };

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
    const { categories, specialization, collapsed } = this.state;

    return (
      <View style={styles.container}>
        <ScrollView style={{ width: '100%' }} contentContainerStyle={{ alignItems: 'center' }}>
          <View style={styles.containerForCategories}>
            {categories.map((category, cat_index) => (
              <View style={styles.categoryWrapper} key={category.id}>
                <View
                  style={{
                    width: '100%',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}
                >
                  <View style={styles.categoriesLeftPart}>
                    <Text allowFontScaling={false} style={styles.categoryText}>
                      {category.categoryName}{' '}
                      <Text allowFontScaling={false} style={{ color: '#c20021' }}>
                        ({category.specializations ? category.specializations.length : 0})
                      </Text>
                    </Text>
                    <View>
                      {category.specializations &&
                        category.specializations.map(
                          (spec, index) =>
                            (index < 5 || collapsed[cat_index]) && (
                              <Text
                                allowFontScaling={false}
                                onPress={() => this.choose(spec)}
                                style={styles.specs}
                                key={index}
                              >
                                {getNamesLocal(spec.specName, spec.specNameKz)}
                              </Text>
                            ),
                        )}
                    </View>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Entypo size={26} name={'chevron-right'} color="#c20021" />
                    <Image
                      style={{ width: 100, height: 160 }}
                      source={{
                        uri: category.avatar
                          ? `${config.url}/images/${category.avatar.imageName}`
                          : 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAANlBMVEXz9Pa5vsq2u8jN0dnV2N/o6u7FydPi5Onw8fS+ws3f4ee6v8v29/jY2+Hu7/Ly9PbJztbQ1dxJagBAAAAC60lEQVR4nO3b2ZaCMBREUQbDJOP//2wbEGVIFCHKTa+zH7uVRVmBBJQgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMCpdOzvQQqaq2KmuSrOzQ02lSeRem8rpsQq/ozg72Kj4UkAxEev8awnzs7P1yiIadsfpQXjfZCHhUCzbfmeurdNz6bDRsBWRsB+k0cXxdHjpa0wkTBn3hKnjzRZyEgYk3IeEv2RKWCt1cN9EJ0zjfm7Mq/rAVgUnbLpwnK/zA2tnuQmzJHquuqJq91blJuwmAW8rHbV3q2ITFrOAt7Xz3l2UmrBMlpcHe9fOUhOqRYVhFO/cqtSEy0H6bh/tJ1uhCctqlTB/NSnG9pOt1ISXjxLq825laVFowo9GaRPrF9talJqw3n6macaZ09yi1ISG2cLyriwePwxzi1ITru4s2naxma59TC2KTRjE83FqmQ6yeDaUDS3KTRhMV96h5TTSLD4HQ4uCE9bxePUU5pYL/3mD5o9CcMKgTONc39NNLrV5iK4aNLUoOWHQ38RQtW3nsm6db92i8ISvGBtct+hvwqyzBFxE9DehrcHlQPU1YWNvcNGirwlfNThv0ZOE9eJG1OsGZy36kVBdczU9e7RvAz5b9CFhqfIwSp4XwG+OwUWLPiRUV/33Z4tbGtTvGK635CfUDfb/SO5rt20N9t8m65fLT9g3GD5abDY2qC+lvEg4NjhEvLW4tUFvEj4a7OXq3TzoW8Jpg0PEzfk8SThv8EMeJFw1+O8SHmrQg4QHG/Qg4cEGxSc83KD4hIcblJ6w3L508TXh+vtDEpLw3GwDEpKQhOdznVD2fRr9tdpRw/1HqQndIeEvkXCXUlDC+1NBndsnge/fwyVnp9PGH3p95dm1WMKza4/fI37j+UPXR/c+2X9/hjQI0uO3LsyuMioM9A8Sjy/W1iIhY7Sn2tzpUahdWyXiNDNSxcWtSlCBAAAAAAAAAAAAAAAAAAAAAAAAAAAAwCn+AEXGNosxDBhFAAAAAElFTkSuQmCC',
                      }}
                    />
                  </View>
                </View>
                {category.specializations &&
                  category.specializations.length > 5 &&
                  (collapsed[cat_index] ? (
                    <TouchableOpacity
                      onPress={() => {
                        this.unCollapse(cat_index);
                      }}
                    >
                      <Text allowFontScaling={false} style={styles.more}>
                        {t('simple:close')}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      onPress={() => {
                        this.collapse(cat_index);
                      }}
                    >
                      <Text allowFontScaling={false} style={styles.more}>
                        + {t('simple:showMore')}
                      </Text>
                    </TouchableOpacity>
                  ))}
              </View>
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
)(hoistStatics(withTranslation()(OneSpecList), OneSpecList));
