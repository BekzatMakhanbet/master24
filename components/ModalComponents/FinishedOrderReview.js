import Axios from 'axios';
import { Icon, Input, Item, Spinner } from 'native-base';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, Modal, StyleSheet, Text, View } from 'react-native';
import { AirbnbRating, Avatar, Button } from 'react-native-elements';
import { connect } from 'react-redux';
import getFontSize from '../../utils/getFontSize';
import config from '../../config/config';

const { width } = Dimensions.get('window');

const FinishedOrderReview = ({
  visibleModal,
  navigateToOrder,
  orderText,
  reviewId,
  authReducer,
}) => {
  const [review, setReview] = useState({});
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    if (reviewId) {
      setLoading(true);
      Axios.get(`${config.url}/api/v1/review/${reviewId}`).then((res) => {
        setReview(res.data);
        setLoading(false);
      });
    }
    return () => {
      setReview(null);
    };
  }, [reviewId]);

  return (
    visibleModal && (
      <Modal animationType="fade" transparent={true} visible={visibleModal}>
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
          {loading ? (
            <Spinner color="red" />
          ) : (
            <View style={styles.modalRoot}>
              <Text allowFontScaling={false} style={styles.title}>
                {orderText}
              </Text>

              {review && review.user && (
                <Avatar
                  size="large"
                  rounded
                  source={{
                    uri:
                      review && review.user.avatar
                        ? `${config.url}/images/${review && review.user.avatar.imageName}`
                        : 'https://media.istockphoto.com/photos/icon-of-a-businessman-avatar-or-profile-pic-picture-id474001892?k=6&m=474001892&s=612x612&w=0&h=6g0M3Q3HF8_uMQpYbkM9XAAoEDym7z9leencMcC4pxo=',
                  }}
                />
              )}
              {review && review.user && (
                <Text
                  allowFontScaling={false}
                  style={{
                    fontSize: getFontSize(19),
                    fontWeight: '500',
                    textAlign: 'center',
                  }}
                >
                  {review && review.user.firstName} {review && review.user.lastName}
                </Text>
              )}
              {review && review.rating ? (
                <View style={{ marginTop: getFontSize(20) }}>
                  <Text
                    allowFontScaling={false}
                    style={{
                      fontSize: getFontSize(15),
                      fontWeight: '500',
                      textAlign: 'center',
                      marginBottom: review.rating ? getFontSize(-20) : 0,
                    }}
                  >
                    {t('simple:customerGrage')}:
                  </Text>
                  <AirbnbRating
                    type="custom"
                    reviews={[]}
                    count={5}
                    defaultRating={review.rating}
                    readonly
                    ratingColor="#c20021"
                    ratingBackgroundColor="#c20021"
                    size={width / 12}
                    height={width / 8}
                  />
                </View>
              ) : (
                <Text
                  allowFontScaling={false}
                  style={{
                    fontSize: getFontSize(15),
                    fontWeight: '500',
                    textAlign: 'center',
                    marginVertical: 15,
                  }}
                >
                  {t('simple:noGrade')}
                </Text>
              )}
              {review.text ? (
                <Item
                  style={{
                    backgroundColor: '#e9f0f4',
                    paddingVertical: 10,
                    marginVertical: 5,
                    borderRadius: 5,
                  }}
                >
                  <Icon style={{ marginLeft: 10 }} name="chatboxes" />
                  <Input
                    multiline={true}
                    style={{ fontSize: getFontSize(15) }}
                    disabled
                    value={review.text ? review.text : 'Заказчик не оставил отзыв'}
                  />
                </Item>
              ) : (
                <></>
              )}

              <Button
                onPress={navigateToOrder}
                buttonStyle={styles.button}
                title={t('createOrder:continuneButton')}
              />
            </View>
          )}
        </View>
      </Modal>
    )
  );
};

const styles = StyleSheet.create({
  modalRoot: {
    width: width * 0.9,
    backgroundColor: '#fff',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  title: {
    fontSize: getFontSize(20),
    width: '80%',
    marginBottom: 15,
    fontWeight: '500',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#0288c7',
    borderRadius: 5,
    marginTop: getFontSize(10),
    alignSelf: 'center',
    height: getFontSize(50),
  },
  icon: {
    width: 56,
    height: 56,
    alignSelf: 'center',
  },
  titleTextModal: {
    fontSize: getFontSize(24),
    marginBottom: 10,
    fontWeight: '600',
    width: '100%',
    textAlign: 'center',
  },
  describeTextModal: {
    fontSize: getFontSize(16),
    fontWeight: '500',
    textAlign: 'center',
  },
  buttonModal: {
    backgroundColor: '#0288c7',
    width: '100%',
    alignItems: 'center',
    textAlign: 'center',
    marginVertical: 5,
  },
});

export default connect(({ authReducer }) => ({ authReducer }), {})(FinishedOrderReview);
