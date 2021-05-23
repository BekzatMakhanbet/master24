import { AntDesign, FontAwesome, Octicons } from '@expo/vector-icons';
import axios from 'axios';
import { Spinner } from 'native-base';
import React from 'react';
import {
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image } from 'react-native-elements';
import { connect } from 'react-redux';
import { switchMode } from '../../actions/modeActions';
import wrapToHoc from '../../hoc/wrapToHoc';
import i18n from '../../i18n';
import { store } from '../../store';
import getDateByMonth from '../../utils/getDateByMonth';
import { getModeColor } from '../../utils/getModeColor';
import getNamesLocal from '../../utils/getNamesLocal';
import config from '../../config/config';

class News extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const { state } = navigation;
    return {
      title: i18n.t('menu:news'),
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

  state = {
    refreshing: false,
    spinning: false,
    mode: '',
    news: [],
  };

  componentDidMount() {
    this.refresh();
    this.setState({ spinning: true });
    const { mode } = this.props.modeReducer;
    if (mode != this.state.mode) {
      this.props.navigation.setParams({ color: getModeColor(mode) });
      this.setState({ mode });
    }
  }

  refresh = () => {
    const headers = {};
    axios
      .get(`${config.url}/api/v1/news/all?city=${this.props.authReducer.city.id}`, { headers })
      .then((res) => {
        var sort = res.data.news.slice(0);
        sort.sort((a, b) => {
          return b.id - a.id;
        });
        this.setState({ spinning: false });
        this.setState({ news: sort });
      });
  };

  componentDidUpdate(props) {
    const { mode } = this.props.modeReducer;
    if (mode != this.state.mode) {
      this.props.navigation.setParams({ color: getModeColor(mode) });
      this.setState({ mode });
    }
  }

  render() {
    const { navigate } = this.props.navigation;
    return (
      <View>
        <ScrollView
          refreshControl={
            <RefreshControl
              //refresh control used for the Pull to Refresh
              refreshing={this.state.spinning}
              onRefresh={this.refresh}
            />
          }
        >
          <View style={{ width: '100%', justifyContent: 'center', paddingTop: 10 }}>
            {this.state.spinning ? (
              <Spinner color="red" />
            ) : this.state.news.length > 0 ? (
              <FlatList
                data={this.state.news}
                renderItem={({ item, index }) => {
                  return (
                    <FlatListItem
                      item={item}
                      navigate={navigate}
                      index={index}
                      addNew={
                        index === this.state.news.length - 1
                          ? this.state.news[0]
                          : this.state.news[index + 1]
                      }
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
                    textAlign: 'center',
                    fontSize: 16,
                    fontWeight: '500',
                    marginVertical: 20,
                    color: '#999999',
                  }}
                >
                  {this.props.t('simple:noNews')}
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    );
  }
}

export class FlatListItem extends React.Component {
  render() {
    return (
      <TouchableOpacity
        onPress={() => {
          this.props.navigate('NewsMain', {
            news: this.props.item,
            addNew: this.props.addNew,
          });
        }}
      >
        <View style={{ flex: 1 }}>
          <View style={styles.orderContainer}>
            <View style={styles.orderText}>
              <Text
                allowFontScaling={false}
                style={{
                  color: 'black',
                  fontWeight: '600',
                  fontSize: 18,
                }}
              >
                {getNamesLocal(this.props.item.header, this.props.item.headerKz)}
              </Text>
              <View>
                <Text
                  allowFontScaling={false}
                  style={{
                    color: 'black',
                    fontWeight: '400',
                    fontSize: 15,
                    width: '90%',
                  }}
                >
                  {getNamesLocal(this.props.item.text, this.props.item.textKz).substring(0, 50)}
                  ...
                </Text>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginVertical: 5,
                  width: '90%',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <FontAwesome name="clock-o" size={22} color="#c1c3c7" />
                  <Text allowFontScaling={false} style={styles.bottomGreyTexts}>
                    {' '}
                    {getDateByMonth(this.props.item.created)}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <AntDesign name="eye" size={22} color="#c1c3c7" />
                  <Text allowFontScaling={false} style={styles.bottomGreyTexts}>
                    {' '}
                    {this.props.item.viewCount}
                  </Text>
                </View>
              </View>
            </View>
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <View style={styles.orderPerson}>
                <Image
                  source={{
                    uri: this.props.item.image
                      ? `${config.url}/images/${this.props.item.image.imageName}`
                      : 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAACoCAMAAABt9SM9AAAAElBMVEXy8vL////6+vr19fX4+Pj8/Px/aeudAAACoklEQVR4nO3c227bMBBF0cgk//+XGwu6kRxeRnFaVGevt8a2AG3QQ0kN8vUFAAAAAAAAAAAAAAAAAAAAAACAv2j5Ba9/fVK/hVgOxHL4Prf0+qD08FgfPbfw8Fjpk8cjlgOxHIjlQCwHYjlIxgoh3DqeXqyQbl+Ky8VK551L9B5PLFb40X2eWKyf3RVrxUpFrMU36KVihbKV88pCKtarfjzlWlpSsepWvh1RPZbr3JVi1SPLObSUYlkri1g7ZpZDGau6zGI3PJWxjKHV+3gqv6NSsXxX8KkqoxWrXFq98R7rkaYVq6jVaxWMpScWK6vVPW9rqKnF2r5e71e6G6G5+vRifZ9zjHFwyZDM9acYayx7PHEOeWIZ4pI5ViGxatW16/UFYlUfsy/HiFUx7iC3oxCrZDx73oc8sQrRarUNeWLlrKepx5AnVqbZaq0lHytmd3/tVu8jqccK2VuMjfA65NVjLdf3mBvhKYjHStuaWTU2wkst6Vj71+64MBiTjXV+7cL2dmK1XJdS+W9i5bI2qfoJsYpXy1rDEa8aq7ymitYPibWqr6nWIT+spRjL+sJNbYmCsexR3n5FOpYdYmZL1IvVmkxrif6WKBerPcXHW6JarN7SGW6JYrH6Q2m0JYrF6rYabolasQatRluiVKzJG5rmXFOKNXhyvOpuiUKxJh4rLP0tUSfW3JPj7ddm1GNNtuptiTKxxsN9194SVWLNDPesifUBkVhzw33X2hI1Ys0O911jS9SI5WzVukuUiDU/3A/vj1XrUSHWjVb2/44JxPJshEWYl/GzJzpieYf7ztgSHx/rbitrS3x8rDsDa7MeJ+0UYn2K9i+zOT09Fn8ueNbCH6Ked3+utxGLWMQCAAAAAAAAAAAAAAAAAAAAAAD4//0BUyATTom0AxcAAAAASUVORK5CYII=',
                  }}
                  style={{ width: 100, height: 100, marginLeft: 10 }}
                />
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }
}

export default connect(({ authReducer, modeReducer }) => ({ authReducer, modeReducer }), {
  switchMode,
})(wrapToHoc(News));

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
    width: '70%',
    paddingRight: 7,
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
  bottomGreyTexts: {
    fontSize: 15,
    color: '#c1c3c7',
    lineHeight: 16,
    fontWeight: '500',
  },
});
