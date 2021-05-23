import { AntDesign, FontAwesome } from '@expo/vector-icons';
import axios from 'axios';
import hoistStatics from 'hoist-non-react-statics';
import React from 'react';
import { withTranslation } from 'react-i18next';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'react-native-elements';
import { WebView } from 'react-native-webview';
import { connect } from 'react-redux';
import { login } from '../../actions/authActions';
import { localizationChange } from '../../actions/localActions';
import i18n from '../../i18n';
import { store } from '../../store';
import getDateByMonth from '../../utils/getDateByMonth';
import { getModeColor } from '../../utils/getModeColor';
import getNamesLocal from '../../utils/getNamesLocal';
import { FlatListItem } from './NewsScreen';
import config from '../../config/config';

const { width } = Dimensions.get('window');

class NewsMainScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const { state } = navigation;
    return {
      title: i18n.t('menu:news'),
      headerLeft: (
        <TouchableOpacity
          onPress={() => {
            navigation.goBack(null);
          }}
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
      visibleImage: false,
      imageIndex: '',
    };
  }

  openImage = (index) => {
    this.setState({ imageIndex: index, visibleImage: true });
  };

  componentDidMount() {
    const { mode } = this.props.modeReducer;
    const { id } = this.props.navigation.getParam('news');

    axios
      .patch(`${config.url}/api/v1/news/view-count/${id}`, {}, { headers: {} })
      .then((res) => console.log('send', res.data))
      .catch((err) => console.log(err));

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

  render() {
    const {
      created,
      text,
      textKz,
      header,
      headerKz,
      image,
      viewCount,
      youtubeVideo,
    } = this.props.navigation.getParam('news');

    const addNew = this.props.navigation.getParam('addNew');

    const { navigate } = this.props.navigation;
    const news = {
      title: 'Было заказно рекордное количество заказов',
      text:
        'В прошлом году возделывание какао и производство кокаина в Колумбии достигло рекордных масштабов", — в частности, сказал глава государства. Это рассмешило микроблогеров, а некоторые ужаснулись тому, что он не может даже прочитать текст.',
      date: '17.03.2019',
      views: 142,
    };

    return (
      <ScrollView style={styles.container}>
        <View style={{ width: '90%', alignSelf: 'center', paddingVertical: 20 }}>
          <Text
            allowFontScaling={false}
            style={{ fontSize: 20, fontWeight: '500', color: 'black' }}
          >
            {getNamesLocal(header, headerKz)}
          </Text>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginVertical: 5,
              width: '100%',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <FontAwesome name="clock-o" size={22} color="#c1c3c7" />
              <Text allowFontScaling={false} style={styles.bottomGreyTexts}>
                {' '}
                {getDateByMonth(created)}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <AntDesign name="eye" size={22} color="#c1c3c7" />
              <Text allowFontScaling={false} style={styles.bottomGreyTexts}>
                {' '}
                {viewCount}
              </Text>
            </View>
          </View>
        </View>
        <View style={{ width: '100%', height: 30, backgroundColor: '#e9f0f4' }} />
        <View style={{ width: '90%', alignSelf: 'center' }}>
          {getNamesLocal(text, textKz)
            .split('<br/>')
            .map((texts) => (
              <Text allowFontScaling={false} style={styles.textInfo}>
                {texts}
              </Text>
            ))}
        </View>
        <View
          style={{
            width: '90%',
            alignSelf: 'center',
            marginTop: 20,
          }}
        >
          <Image
            source={{
              uri: image
                ? `${config.url}/images/${image.imageName}`
                : 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAACoCAMAAABt9SM9AAAAElBMVEXy8vL////6+vr19fX4+Pj8/Px/aeudAAACoklEQVR4nO3c227bMBBF0cgk//+XGwu6kRxeRnFaVGevt8a2AG3QQ0kN8vUFAAAAAAAAAAAAAAAAAAAAAACAv2j5Ba9/fVK/hVgOxHL4Prf0+qD08FgfPbfw8Fjpk8cjlgOxHIjlQCwHYjlIxgoh3DqeXqyQbl+Ky8VK551L9B5PLFb40X2eWKyf3RVrxUpFrMU36KVihbKV88pCKtarfjzlWlpSsepWvh1RPZbr3JVi1SPLObSUYlkri1g7ZpZDGau6zGI3PJWxjKHV+3gqv6NSsXxX8KkqoxWrXFq98R7rkaYVq6jVaxWMpScWK6vVPW9rqKnF2r5e71e6G6G5+vRifZ9zjHFwyZDM9acYayx7PHEOeWIZ4pI5ViGxatW16/UFYlUfsy/HiFUx7iC3oxCrZDx73oc8sQrRarUNeWLlrKepx5AnVqbZaq0lHytmd3/tVu8jqccK2VuMjfA65NVjLdf3mBvhKYjHStuaWTU2wkst6Vj71+64MBiTjXV+7cL2dmK1XJdS+W9i5bI2qfoJsYpXy1rDEa8aq7ymitYPibWqr6nWIT+spRjL+sJNbYmCsexR3n5FOpYdYmZL1IvVmkxrif6WKBerPcXHW6JarN7SGW6JYrH6Q2m0JYrF6rYabolasQatRluiVKzJG5rmXFOKNXhyvOpuiUKxJh4rLP0tUSfW3JPj7ddm1GNNtuptiTKxxsN9194SVWLNDPesifUBkVhzw33X2hI1Ys0O911jS9SI5WzVukuUiDU/3A/vj1XrUSHWjVb2/44JxPJshEWYl/GzJzpieYf7ztgSHx/rbitrS3x8rDsDa7MeJ+0UYn2K9i+zOT09Fn8ueNbCH6Ked3+utxGLWMQCAAAAAAAAAAAAAAAAAAAAAAD4//0BUyATTom0AxcAAAAASUVORK5CYII=',
            }}
            style={{ width: '100%', height: 200 }}
          />
        </View>
        {youtubeVideo && youtubeVideo.length && (
          <WebView
            source={{
              uri: `https://www.youtube.com/embed/${youtubeVideo.substring(
                youtubeVideo.lastIndexOf('/') + 1,
                youtubeVideo.length,
              )}`,
            }}
            useWebKit={true}
            style={{
              width: '90%',
              height: 220,
              marginTop: 20,
              alignSelf: 'center',
            }}
          />
        )}
        <View style={{ height: 20 }} />
        <View style={{ width: '100%', height: 30, backgroundColor: '#e9f0f4' }} />
        <View style={{ width: '90%', alignSelf: 'center' }}>
          <Text
            allowFontScaling={false}
            style={{
              fontSize: 19,
              fontWeight: '500',
              color: 'black',
              paddingVertical: 15,
            }}
          >
            {this.props.t('simple:anotherNews')}
          </Text>
        </View>
        <FlatListItem
          item={addNew}
          addNew={this.props.navigation.getParam('news')}
          navigate={navigate}
        />
        <View style={{ height: 30 }} />
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flex: 1,
  },
  bottomGreyTexts: {
    fontSize: 15,
    color: '#c1c3c7',
    lineHeight: 16,
    fontWeight: '500',
  },
  textInfo: {
    color: 'black',
    fontWeight: '400',
    textAlign: 'left',
    flexShrink: 1,
    marginVertical: 7,
    fontSize: 15,
  },
});

export default connect(
  ({ modeReducer, localReducer, authReducer }) => ({
    modeReducer,
    localReducer,
    authReducer,
  }),
  { localizationChange, login },
)(hoistStatics(withTranslation()(NewsMainScreen), NewsMainScreen));
