/* eslint-disable no-alert */
import { AntDesign, Octicons } from '@expo/vector-icons';
import axios from 'axios';
import { Linking } from 'expo';
import Constants from 'expo-constants';
import * as ImagePicker from 'expo-image-picker';
import * as Permissions from 'expo-permissions';
import hoistStatics from 'hoist-non-react-statics';
import { Content, Spinner } from 'native-base';
import React from 'react';
import { withTranslation } from 'react-i18next';
import { ScrollView, Share, Text, TouchableOpacity, View } from 'react-native';
import { Button as ElementsButton } from 'react-native-elements';
import ImageView from 'react-native-image-view';
import { withNavigationFocus } from 'react-navigation';
import { connect } from 'react-redux';
import { login, logout } from '../../actions/authActions';
import { localizationChange } from '../../actions/localActions';
import { switchMode } from '../../actions/modeActions';
import { addNotifications } from '../../actions/notificationActions';
import { CameraComponent } from '../../components/Camera/Camera';
import { ChangeMobilePhone } from '../../components/ChangeMobilePhone/ChangeMobilePhone';
import Guides from '../../components/Guides/Guides';
import { DeleteSampleModal } from '../../components/ModalComponents/DeleteSampleModal';
import { ServiceModal } from '../../components/ModalComponents/ServiceModalComponent';
import { VideoModal } from '../../components/ModalComponents/VideoModalComponent';
import config from '../../config/config';
import defaultImages from '../../constants/defaultImages';
import stylesObject from '../../constants/style/stylesObject';
import { store } from '../../store';
import { getModeColor } from '../../utils/getModeColor';
import { ClientInputs } from './components/ClientInputs';
import { ConfirmProfile } from './components/ConfirmProfile';
import { LogoutButton } from './components/LogoutButton';
import { MasterPhone } from './components/MasterPhone';
import { MasterProfileInfo } from './components/MasterProfileInfo';
import { MasterType } from './components/MasterType';
import { Notes } from './components/Notes';
import { OnlineBadge } from './components/OnlineBadge';
import { PopupInfo } from './components/PopupInfo';
import { Reviews } from './components/Reviews';
import { SaveClientButton } from './components/SaveClientButton';
import { SegmentButtons } from './components/SegmentButtons';
import { Serivces } from './components/Serivces';
import { Specs } from './components/Specs';
import { TopInfoHeader } from './components/TopInfoHeader';
import { UserAvatar } from './components/UserAvatar';
import { Video } from './components/Video';
import { WorkPhotos } from './components/WorkPhotos';
import styles from './styles';

class Profile extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const { state } = navigation;
    return {
      title: 'Профиль',
      headerLeft: (
        <TouchableOpacity onPress={navigation.openDrawer} style={stylesObject.drawerOpenButton}>
          <Octicons size={26} name={'three-bars'} color="white" />
        </TouchableOpacity>
      ),
      headerRight: store.getState().modeReducer.mode === 'master' && (
        <View style={stylesObject.defaultFlexRow}>
          <TouchableOpacity
            onPress={state.params && state.params.onShare}
            style={stylesObject.paddingRight15}
          >
            <AntDesign size={24} name={'sharealt'} color="white" />
          </TouchableOpacity>

          <Guides screenName="Profile" />
        </View>
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
    const { name, surname, sex, city, username } = this.props.authReducer;
    this.state = {
      name,
      surname,
      sex,
      city,
      username,
      birthday: '',
      mode: '',
      edit: false,
      image: null,
      user: '',
      avatar: '',
      notes: '',
      iin: '',
      masterType: null,
      orgName: null,
      refreshing: true,
      activePage: 1,
      imageIndex: 0,
      visibleImage: false,
      visibleAvatar: false,
      cities: [],
      histCallCount: 0,
      deleteImageId: 0,
      deleteServiceId: 0,
      deleteImageModal: false,
      deleteServiceModal: false,
      notLoggedIn: false,
      popUpInfo: false,
      popUpInfo2: false,
      popUpInfo3: false,
      changeMobileNumber: false,
      collapseReviews: false,
    };
  }

  handleNotification = () => {
    this.setState((old) => ({ notification: !old.notification }));
  };

  getPermissionAsync = async () => {
    if (Constants.platform.ios) {
      const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
      if (status !== 'granted') {
        alert('Нужен доступ к Вашей камере!');
      }
    }
  };

  _pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.cancelled) {
      this.setState({ avatar: result.uri });
    }
  };

  _pickWorkImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      allowsEditing: false,
      aspect: [3, 5],
    });

    if (!result.cancelled) {
      this.saveWorkImage(result.uri);
    }
  };

  saveWorkImage = (uri) => {
    const files = new FormData();
    this.setState({ refreshing: true });

    files.append('files', {
      uri: uri,
      type: 'image/jpeg',
      name: 'order-picture',
    });
    axios({
      method: 'POST',
      url: `${config.url}/api/v1/image/user/${this.state.user.id}/work-photos`,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      data: files,
    })
      .then((res) => {
        this.refresh();
      })
      .catch((err) => {
        console.log(err);
        this.setState({ refreshing: false });
      });
  };

  _pickIdImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      allowsEditing: false,
      aspect: [3, 5],
    });

    if (!result.cancelled) {
      this.setState({ refreshing: true });
      const files = new FormData();

      files.append('files', {
        uri: result.uri,
        type: 'image/jpeg',
        name: 'id-picture',
      });
      axios({
        method: 'POST',
        url: `${config.url}/api/v1/image/user/${this.state.user.id}/identification`,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        data: files,
      })
        .then((res) => {
          this.refresh();
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  refreshUsername = (username) => {
    //After the updating mobile phone number relogin and refresh the information in Redux

    this.setState({ refreshing: true });
    axios
      .post(`${config.url}/api/v1/auth/login`, {
        username,
      })
      .then((token) => {
        axios
          .get(`${config.url}/api/v1/user/${username}`)
          .then((res) => {
            this.setState({ user: res.data, refreshing: false });
            this.props.login(
              true,
              res.data.firstName,
              res.data.lastName,
              res.data.sex,
              res.data.city,
              res.data.username,
              res.data.id,
              res.data.master,
              token.data.accessToken,
              res.data.avatar,
              res.data.specializations,
            );
          })
          .catch((err) => {
            console.log(err);
          });
      });
  };

  refresh = () => {
    //Refresh the user and Update information in redux
    this.setState({ refreshing: true });

    if (this.props.authReducer.loggedIn) {
      axios
        .get(`${config.url}/api/v1/city/all`)
        .then((res) => {
          this.setState({ spinning: false, cities: res.data.cities });
        })
        .catch((err) => {
          console.log(err);
        });

      axios
        .get(`${config.url}/api/v1/user/${this.props.authReducer.username}`)
        .then((res) => {
          this.setState({ user: res.data, refreshing: false });
          console.log('SET LOGGED IN PROFILE');

          this.props.login(
            true,
            res.data.firstName,
            res.data.lastName,
            res.data.sex,
            res.data.city,
            res.data.username,
            res.data.id,
            res.data.master,
            this.props.authReducer.token,
            res.data.avatar,
            res.data.specializations,
          );
        })
        .catch((err) => {
          console.log(err);
        });

      axios
        .get(`${config.url}/api/v1/history/responded-master/${this.props.authReducer.id}`, {
          headers: {},
        })
        .then((res) => {
          let histCallCount = 0;
          res.data.communicationHistories.map((hist) => {
            histCallCount++;
          });
          this.setState({ histCallCount });
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      this.setState({ notLoggedIn: true });
    }
  };

  componentDidMount() {
    this.refresh();
    this.getPermissionAsync();
    this.props.navigation.setParams({
      onShare: this.onShare,
    });
  }

  componentDidUpdate(props) {
    if (props.isFocused !== this.props.isFocused) {
      this.refresh();
    }
  }

  componentWillReceiveProps(props) {
    const { mode } = props.modeReducer;
    if (mode !== this.state.mode) {
      this.props.navigation.setParams({ color: getModeColor(mode) });
      this.setState({ mode });
    }
  }

  changeMode = () => {
    //Change mode to Editing or Watching Profile
    this.setState(
      (old) => ({ edit: !old.edit }),
      () => {
        if (!this.state.edit) {
          this.updateUserInfo();
        } else {
          const { notes, iin, masterType, orgName } = this.state.user;
          this.setState({ notes, iin, masterType, orgName });
        }
      },
    );
  };

  updateUserInfo = () => {
    const {
      name,
      surname,
      birthday,
      city,
      sex,
      notes,
      iin,
      avatar,
      masterType,
      orgName,
    } = this.state;
    this.setState({ refreshing: true });
    const birthdayString = new Date(birthday);

    let body = {
      city: city && city.id ? city.id : city,
      firstName: name,
      lastName: surname,
      sex,
      birthday:
        birthday === ''
          ? undefined
          : `${birthdayString.getFullYear()}-${
              birthdayString.getMonth() < 10
                ? `0${birthdayString.getMonth() + 1}`
                : birthday.getMonth() + 1
            }-${birthdayString.getDate() < 10 ? `0${birthday.getDate()}` : birthday.getDate()}`,
    };

    if (this.props.modeReducer.mode === 'master') {
      Object.assign(body, { notes }, { iin }, { masterType }, { orgName });
    }

    axios
      .put(`${config.url}/api/v1/user/${this.props.authReducer.username}`, body)
      .then((res) => {
        if (avatar !== '') {
          this.updateAvatar(avatar);
        } else {
          this.refresh();
        }
      })
      .catch((err) => console.log('err', err));
  };

  updateAvatar = (avatar) => {
    const files = new FormData();
    files.append('file', {
      uri: avatar,
      type: 'image/jpeg',
      name: 'avatar-picture',
    });

    axios({
      method: 'POST',
      url: `${config.url}/api/v1/image/user/${this.state.user.id}`,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      data: files,
    })
      .then(() => {
        this.refresh();
      })
      .catch((err) => {
        console.log(err);
      });
  };

  onShare = async () => {
    try {
      await Share.share({
        message: `http://${config.appHost}/--/MasterProfileForClient?hasOrder=${false}&username=${
          this.state.user.username
        }`,
      });
    } catch (error) {
      alert(error.message);
    }
  };

  openImageView = (index) => {
    this.setState({ imageIndex: index, visibleImage: true });
  };

  createService = ({ name, cost, unit }) => {
    this.setState({ refreshing: true });

    const body = { services: [{ name, cost, unit }] };
    axios
      .put(`${config.url}/api/v1/user/${this.props.authReducer.username}`, body)
      .then((res) => {
        this.refresh();
      })
      .catch((err) => {
        console.log(err);
        this.setState({ refreshing: false });
      });
  };

  deleteService = () => {
    this.setState({ deleteServiceModal: false, refreshing: true });
    axios
      .delete(`${config.url}/api/v1/service/${this.state.deleteServiceId}`, {
        headers: {},
      })
      .then((res) => {
        this.refresh();
      })
      .catch((err) => {
        console.log(err);
        this.setState({ refreshing: false });
      });
  };

  deleteImage = () => {
    this.setState({ deleteImageModal: false, refreshing: true });
    axios
      .delete(`${config.url}/api/v1/image/${this.state.deleteImageId}`, {
        headers: {},
      })
      .then((res) => {
        this.refresh();
      })
      .catch((err) => {
        console.log(err);
        this.setState({ refreshing: false });
      });
  };

  exit = () => {
    if (this.props.modeReducer.mode === 'master') {
      this.props.switchMode();
    }
    this.props.addNotifications([]);
    axios({
      method: 'PATCH',
      url: `${config.url}/api/v1/push/token`,
      data: {
        token: 'exited',
        userId: this.state.user.id,
      },
      headers: {},
    });
    this.props.logout();

    this.props.navigation.navigate('LogInClient');
  };

  selectComponent = (activePage) => () =>
    this.setState({ activePage }, () => console.log(activePage));

  createVideo = (videoName) => {
    this.setState({ refreshing: true });
    axios
      .put(`${config.url}/api/v1/user/${this.props.authReducer.username}`, {
        videos: [videoName],
      })
      .then((res) => {
        this.refresh();
      })
      .catch((err) => {
        console.log(err);
        this.setState({ refreshing: false });
      });
  };

  setStateValues = (stateName, stateValue) => {
    this.setState({ [stateName]: stateValue });
  };

  render() {
    const { t } = this.props;
    const { name, surname, sex, city } = this.props.authReducer;
    const { mode } = this.props.modeReducer;

    let { edit, user, refreshing, activePage } = this.state;

    const usernameMatch = user.username && user.username.match(/^(\d{3})(\d{3})(\d{2})(\d{2})$/);
    const phoneNumber =
      user.username &&
      user.username &&
      '(' +
        usernameMatch[1] +
        ') ' +
        usernameMatch[2] +
        '-' +
        usernameMatch[3] +
        '-' +
        usernameMatch[4];

    const color = getModeColor(mode);

    const { worksPhotos } = user;
    if (worksPhotos) {
      for (let i = 0; i < worksPhotos.length; i++) {
        worksPhotos[i].source = {
          uri: `${config.url}/images/${worksPhotos[i].imageName}`,
        };
      }
    }

    const activeSpecs = [];

    user && user.specializations.map((spec) => activeSpecs.push(spec.id));

    let radio_props = [
      { label: t('profile:INDIVIDUAL'), value: 'INDIVIDUAL' },
      { label: t('profile:COMPANY'), value: 'COMPANY' },
    ];

    console.log('Hello');

    return (
      <>
        {this.state.camera && (
          <CameraComponent
            saveImage={(data) => {
              this.setState({ avatar: data.uri });
            }}
            closeCamera={() => this.setState({ camera: false })}
          />
        )}
        {refreshing ? (
          <Spinner color={color} />
        ) : mode === 'client' ? (
          <ScrollView>
            <View style={stylesObject.defaultFlexOne}>
              <OnlineBadge />

              <SaveClientButton changeMode={this.changeMode} edit={edit} t={t} />

              <UserAvatar
                edit={edit}
                t={t}
                avatar={this.state.avatar}
                userAvatar={
                  user.avatar
                    ? `${config.url}/images/${user.avatar.imageName}`
                    : defaultImages.defaultAvatar
                }
                setStateValues={this.setStateValues}
                _pickImage={this._pickImage}
              />

              {edit && (
                <View style={stylesObject.defaultWidth100}>
                  <Text allowFontScaling={false} style={styles.pressToChoose}>
                    {t('simple:pressToChoose')}
                  </Text>
                </View>
              )}

              <ClientInputs
                edit={edit}
                t={t}
                setStateValues={this.setStateValues}
                stateValues={{
                  name: this.state.name,
                  surname: this.state.surname,
                  sex: this.state.sex,
                  city: this.state.city,
                }}
                values={{ name, surname, sex, phoneNumber, birthday: this.state.user.birthday }}
                cities={this.state.cities}
              />

              <LogoutButton t={t} exit={this.exit} />

              <ChangeMobilePhone
                visible={this.state.changeMobileNumber}
                refresh={this.refreshUsername}
                closeModal={() => this.setState({ changeMobileNumber: false })}
              />
            </View>
          </ScrollView>
        ) : (
          <ScrollView style={styles.masterRoot}>
            {this.state.cameraWorkPhoto && (
              <CameraComponent
                saveImage={(data) => this.saveWorkImage(data.uri)}
                closeCamera={() => this.setState({ cameraWorkPhoto: false })}
              />
            )}
            <TopInfoHeader
              viewCount={user.viewCount}
              histCallCount={this.state.histCallCount}
              reviewsLength={user.reviews?.length}
            />

            <SaveClientButton changeMode={this.changeMode} edit={edit} t={t} />

            <OnlineBadge />
            <UserAvatar
              edit={edit}
              t={t}
              avatar={this.state.avatar}
              userAvatar={
                user.avatar
                  ? `${config.url}/images/${user.avatar.imageName}`
                  : defaultImages.defaultAvatar
              }
              setStateValues={this.setStateValues}
              _pickImage={this._pickImage}
            />

            {edit && (
              <View style={stylesObject.width100}>
                <Text allowFontScaling={false} style={styles.pressToChoose}>
                  {t('simple:pressToChoose')}
                </Text>
              </View>
            )}

            <MasterProfileInfo user={user} city={city} t={t} />

            <SegmentButtons
              activePage={this.state.activePage}
              setStateValues={this.setStateValues}
              t={t}
              color={color}
              reviewsLength={user.reviews ? user.reviews.length : 0}
            />

            <Content padder>
              {activePage === 1 ? (
                <>
                  <View
                    style={[
                      styles.segment1View,
                      this.state.popUpInfo && styles.segmentBottomPadding,
                    ]}
                  >
                    {this.state.popUpInfo && <PopupInfo t={t} />}
                    <Notes
                      t={t}
                      edit={edit}
                      setStateValues={this.setStateValues}
                      notes={user.notes}
                      notesValue={this.state.notes}
                      popUpInfo={this.state.popUpInfo}
                    />
                  </View>
                  <View style={styles.profileMiddleView}>
                    <Specs specializations={user.specializations} />

                    {edit && (
                      <ElementsButton
                        onPress={() =>
                          this.props.navigation.navigate('SpecListProfile', {
                            activeSpecs,
                          })
                        }
                        containerStyle={styles.button}
                        title={t('simple:updateSpec')}
                      />
                    )}
                    <MasterType
                      t={t}
                      edit={edit}
                      setStateValues={this.setStateValues}
                      radio_props={radio_props}
                      orgName={user.orgName}
                      masterType={user.masterType}
                      stateOrgName={this.state.orgName}
                      stateMasterType={this.state.masterType}
                    />
                  </View>
                  <MasterPhone
                    t={t}
                    edit={edit}
                    setStateValues={this.setStateValues}
                    phoneNumber={phoneNumber}
                  />
                  <ConfirmProfile
                    t={t}
                    edit={edit}
                    setStateValues={this.setStateValues}
                    iin={user.iin}
                    iinValue={this.state.iin}
                    status={user.status}
                    identificationPhotos={user.identificationPhotos}
                    _pickIdImage={this._pickIdImage}
                  />

                  <WorkPhotos
                    t={t}
                    edit={edit}
                    setStateValues={this.setStateValues}
                    worksPhotos={user.worksPhotos}
                    openImageView={this.openImageView}
                    _pickWorkImage={this._pickWorkImage}
                  />

                  <View style={styles.componentsViewWrapper}>
                    <View>
                      {this.state.popUpInfo2 && <PopupInfo t={t} />}
                      <Video
                        videos={user.videos}
                        t={t}
                        edit={edit}
                        setStateValues={this.setStateValues}
                        popUpInfo2={this.state.popUpInfo2}
                      />
                      {edit && (
                        <VideoModal
                          createVideo={this.createVideo}
                          hasVideo={user.videos && user.videos.length}
                        />
                      )}
                    </View>
                  </View>

                  <View style={styles.componentsViewWrapper}>
                    <View>
                      {this.state.popUpInfo3 && <PopupInfo t={t} />}
                      <Serivces
                        t={t}
                        edit={edit}
                        setStateValues={this.setStateValues}
                        popUpInfo3={this.state.popUpInfo3}
                        services={user.services}
                      />
                      {edit && <ServiceModal createService={this.createService} />}
                    </View>
                  </View>

                  <LogoutButton t={t} exit={this.exit} />

                  <ImageView
                    glideAlways
                    images={worksPhotos}
                    imageIndex={this.state.imageIndex}
                    animationType="fade"
                    isVisible={this.state.visibleImage}
                    onClose={() => this.setState({ visibleImage: false })}
                  />
                  <ChangeMobilePhone
                    visible={this.state.changeMobileNumber}
                    refresh={this.refreshUsername}
                    closeModal={() => this.setState({ changeMobileNumber: false })}
                  />
                </>
              ) : (
                <Reviews
                  reviews={user.reviews}
                  collapseReviews={this.state.collapseReviews}
                  setStateValues={this.setStateValues}
                  t={t}
                />
              )}
            </Content>
          </ScrollView>
        )}
        <DeleteSampleModal
          visibleModal={this.state.deleteServiceModal}
          closeErrorModal={() => this.setState({ deleteServiceModal: false })}
          deleteEntity={this.deleteService}
          title={t('simple:delete')}
          text={t('simple:sureDeleteService')}
        />
        <DeleteSampleModal
          visibleModal={this.state.deleteImageModal}
          closeErrorModal={() => this.setState({ deleteImageModal: false })}
          deleteEntity={this.deleteImage}
          title={t('simple:delete')}
          text={t('simple:sureDeleteImage')}
        />
        {user.avatar && (
          <ImageView
            glideAlways
            images={[{ source: { uri: `${config.url}/images/${user.avatar.imageName}` } }]}
            imageIndex={0}
            animationType="fade"
            isVisible={this.state.visibleAvatar}
            onClose={() => this.setState({ visibleAvatar: false })}
          />
        )}
      </>
    );
  }
}

export default withNavigationFocus(
  connect(
    ({ modeReducer, localReducer, authReducer }) => ({
      modeReducer,
      localReducer,
      authReducer,
    }),
    { localizationChange, login, logout, switchMode, addNotifications },
  )(hoistStatics(withTranslation()(Profile), Profile)),
);
