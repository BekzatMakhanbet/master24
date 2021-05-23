import { AntDesign } from '@expo/vector-icons';
import axios from 'axios';
import hoistStatics from 'hoist-non-react-statics';
import { Button, Spinner } from 'native-base';
import React from 'react';
import { withTranslation } from 'react-i18next';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { connect } from 'react-redux';
import { ErrorModal } from '../../components/ModalComponents/ErrorModal';
import { OrderFinishMasterModal } from '../../components/ModalComponents/OrderFinishMasterModal';
import MastersOrderComponent from '../../components/Orders/MastersOrderComponent';
import i18n from '../../i18n';
import { switchMode } from '../../reducers/modeReducer';
import { store } from '../../store';
import { getModeColor } from '../../utils/getModeColor';
import sendPushNotification from '../../utils/sendPushNotification';
import config from '../../config/config';

class MyOrderMaster extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const { state } = navigation;
    return {
      title: i18n.t('order:order'),
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
    const item = this.props.navigation.getParam('item', 0);
    const itemId = props.navigation.getParam('itemId', 0);
    const clientModal = props.navigation.getParam('clientModal', false);
    this.state = {
      mode: '',
      item,
      itemId,
      clientModal,
      successMasterChoosed: false,
      errorModal: false,
      visibleModal: false,
      spinning: false,
    };
  }

  componentDidMount() {
    const { mode } = this.props.modeReducer;

    if (mode === 'client') {
      this.props.navigation.navigate('MyOrders');
    }

    if (mode != this.state.mode) {
      this.props.navigation.setParams({ color: getModeColor(mode) });
      this.setState({ mode });
    }
    if (this.state.item === 0 && this.state.itemId !== 0) {
      this.getSingleOrder();
    }
  }

  componentDidUpdate() {
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

  getSingleOrder = () => {
    axios.get(`${config.url}/api/v1/order?mode=SINGLE&order=${this.state.itemId}`).then((res) => {
      this.setState({ item: res.data.content[0] });
    });
  };

  finishOrder = () => {
    //Method when Master presses to Finish Order. Send notification to Customer about it.
    const { name, surname } = this.props.authReducer;
    this.setState({ visibleModal: false, spinning: true });
    axios({
      method: 'PATCH',
      url: `${config.url}/api/v1/order/${this.state.item.id}`,
      data: { status: 'WAITING_FOR_CUSTOMER_RESPONSE' },
    })
      .then((res) => {
        sendPushNotification(
          `Мастер ${name} ${surname} хочет завершить заказ №${
            this.state.item.id
          } «${this.state.item.description.substring(0, 20)}${
            this.state.item.description.length > 20 ? '...' : ''
          }»`,
          `Мастер ${name} ${surname} №${
            this.state.item.id
          } «${this.state.item.description.substring(0, 20)}${
            this.state.item.description.length > 20 ? '...' : ''
          }» тапсырысты аяқтағысы келеді`,
          'Подтвердите что заказ завершен',
          'Тапсырыстың аяқталғанын растаңыз',
          this.state.item.customer.id,
          'MyOrderFinished',
          this.state.item.id,
          'client',
          'question',
        );
        this.setState({ spinning: false });
        this.props.navigation.goBack(null);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  chooseMaster = (masterId) => {
    //Method when Master accepts the order and send Notification to Customer about Master accepted the order
    const options = {
      method: 'PUT',
      url: `${config.url}/api/v1/order/customer/${this.state.item.id}/select/${masterId}`,
    };
    axios(options)
      .then((res) => {
        axios({
          method: 'PATCH',
          url: `${config.url}/api/v1/order/${this.state.item.id}`,
          data: { status: 'IN_PROGRESS' },
        })
          .then(() => {
            sendPushNotification(
              `заказ №${this.state.item.id} «${this.state.item.description.substring(0, 20)}${
                this.state.item.description.length > 20 ? '...' : ''
              }»`,
              `тапсырыс №${this.state.item.id} «${this.state.item.description.substring(0, 20)}${
                this.state.item.description.length > 20 ? '...' : ''
              }»`,
              'Мастер принял',
              'Мастер қабылдады',
              this.state.item.customer.id,
              'MyOrder',
              this.state.item.id,
              'client',
              'check',
            );
            this.setState({ spinning: false, successMasterChoosed: true });
          })
          .catch((err) => {
            console.log(err);
          });
      })
      .catch(() => {
        this.setState({ errorModal: true });
      });
  };

  render() {
    const spin = this.state.item === 0 || this.state.spinning;

    return (
      <View style={{ flex: 1 }}>
        <ScrollView>
          {!spin ? (
            <MastersOrderComponent
              item={this.state.item}
              client={true}
              t={this.props.t}
              finishOrder={() => this.setState({ visibleModal: true })}
              navigation={this.props.navigation}
              specializations={this.props.authReducer.specializations}
              cityId={this.props.authReducer.city.id}
            />
          ) : (
            <Spinner color="red" />
          )}
          <OrderFinishMasterModal
            visibleModal={this.state.visibleModal}
            closeFinishModal={() => this.setState({ visibleModal: false })}
            finishOrder={this.finishOrder}
          />
          <ErrorModal
            visibleModal={this.state.errorModal}
            closeErrorModal={() => this.setState({ errorModal: false })}
          />
          <Modal animationType="slide" transparent={true} visible={this.state.successMasterChoosed}>
            <View
              style={{
                width: '100%',
                height: '100%',
                alignItems: 'center',
                justifyContent: 'center',
                paddingBottom: 20,
                backgroundColor: 'rgba(0,0,0,0.84)',
              }}
            >
              <View
                style={{
                  width: '80%',
                  paddingHorizontal: 30,
                  paddingVertical: 15,
                  borderRadius: 10,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: '#fff',
                }}
              >
                <Text allowFontScaling={false} style={styles.title}>
                  {this.props.t('simple:acceptedOrder')}
                </Text>

                <Button
                  onPress={() => {
                    this.setState({ successMasterChoosed: false });
                    this.props.navigation.goBack(null);
                  }}
                  style={styles.button}
                >
                  <Text
                    allowFontScaling={false}
                    style={{
                      width: '100%',
                      color: '#fff',
                      textAlign: 'center',
                      fontSize: 16,
                      fontWeight: '500',
                    }}
                  >
                    {this.props.t('simple:close')}
                  </Text>
                </Button>
              </View>
            </View>
          </Modal>
          <Modal
            animationType="slide"
            transparent={true}
            visible={this.state.clientModal && this.state.item.status === 'OPEN'}
          >
            <View
              style={{
                width: '100%',
                height: '100%',
                alignItems: 'center',
                justifyContent: 'center',
                paddingBottom: 20,
                backgroundColor: 'rgba(0,0,0,0.84)',
              }}
            >
              <View
                style={{
                  width: '80%',
                  paddingHorizontal: 30,
                  paddingVertical: 15,
                  borderRadius: 10,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: '#fff',
                }}
              >
                <Text allowFontScaling={false} style={styles.title}>
                  {this.props.t('simple:agreedWithClient')} «
                  {this.state.item.description && this.state.item.description.substring(0, 20)}
                  {this.state.item.description && this.state.item.description.length > 20
                    ? '...'
                    : ''}
                  » ?
                </Text>

                <Button
                  onPress={() => {
                    this.setState({ clientModal: false, spinning: true });
                    this.chooseMaster(this.props.authReducer.id);
                  }}
                  style={styles.button}
                >
                  <Text
                    allowFontScaling={false}
                    style={{
                      width: '100%',
                      color: '#fff',
                      textAlign: 'center',
                      fontSize: 16,
                      fontWeight: '500',
                    }}
                  >
                    {this.props.t('simple:yes')}
                  </Text>
                </Button>
                <Button light onPress={() => this.setState({ clientModal: false })}>
                  <Text
                    allowFontScaling={false}
                    style={{
                      width: '100%',
                      color: '#c20021',
                      textAlign: 'center',
                      fontSize: 16,
                      fontWeight: '500',
                    }}
                  >
                    {this.props.t('simple:no')}
                  </Text>
                </Button>
              </View>
            </View>
          </Modal>
          <View style={{ height: 70 }} />
        </ScrollView>
      </View>
    );
  }
}

export default connect(({ modeReducer, authReducer }) => ({ modeReducer, authReducer }), {
  switchMode,
})(hoistStatics(withTranslation()(MyOrderMaster), MyOrderMaster));

const styles = StyleSheet.create({
  modalBackground: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 20,
    backgroundColor: 'rgba(0,0,0,0.84)',
  },
  modalRoot: {
    width: '80%',
    backgroundColor: '#fff',
    paddingVertical: 40,
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonsContainer: {
    marginTop: 15,
  },
  button: {
    backgroundColor: '#0288c7',
    marginVertical: 7,
  },
});
