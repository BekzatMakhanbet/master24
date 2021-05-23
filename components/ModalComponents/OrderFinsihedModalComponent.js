import { Icon, Input, Item } from 'native-base';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { AirbnbRating, Avatar, Button } from 'react-native-elements';
import config from '../../config/config';
import getFontSize from '../../utils/getFontSize';

const { width, height } = Dimensions.get('window');

export const OrderFinishedModalComponent = ({
  visibleModal,
  setVisibleModal,
  sendReview,
  sendNotification,
  user,
  order,
}) => {
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const refContainer = useRef(null);
  const { t } = useTranslation();

  return (
    visibleModal && (
      <Modal animationType="fade" transparent={true} visible={visibleModal}>
        <KeyboardAvoidingView
          style={styles.modalRoot}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          // keyboardVerticalOffset={Header.HEIGHT + 20}
          enabled
        >
          <ScrollView
            ref={refContainer}
            onContentSizeChange={() => refContainer.current.scrollToEnd({ animated: true })}
          >
            <View
              style={{
                alignItems: 'center',
                paddingTop: 60,
                paddingBottom: 30,
              }}
            >
              <Text allowFontScaling={false} style={styles.title}>
                {t('order:order')} №{order.id} «{order.description.substring(0, 15)}
                {order.description.length > 15 && '...'}» {t('simple:finished')}
              </Text>

              <Avatar
                size="large"
                rounded
                source={{
                  uri:
                    user && user.avatar
                      ? `${config.url}/images/${user.avatar.imageName}`
                      : 'https://media.istockphoto.com/photos/icon-of-a-businessman-avatar-or-profile-pic-picture-id474001892?k=6&m=474001892&s=612x612&w=0&h=6g0M3Q3HF8_uMQpYbkM9XAAoEDym7z9leencMcC4pxo=',
                }}
              />
              <Text
                allowFontScaling={false}
                style={{
                  fontSize: getFontSize(19),
                  fontWeight: '500',
                  textAlign: 'center',
                }}
              >
                {user.firstName} {user.lastName}
              </Text>
              <View style={{ marginTop: 20 }}>
                <Text
                  allowFontScaling={false}
                  style={{
                    fontSize: getFontSize(15),
                    fontWeight: '500',
                    textAlign: 'center',
                  }}
                >
                  {t('simple:gradeMaster')}:
                </Text>
                <AirbnbRating
                  type="custom"
                  reviews={[]}
                  count={5}
                  defaultRating={0}
                  ratingColor="#c20021"
                  ratingBackgroundColor="#c20021"
                  size={width / 8}
                  height={width / 8}
                  onFinishRating={(ratingValue) => setRating(ratingValue)}
                />
              </View>
            </View>
            <Item
              style={{
                backgroundColor: '#e9f0f4',
                paddingVertical: 10,
                marginBottom: 10,
                borderRadius: 5,
              }}
            >
              <Icon style={{ marginLeft: 10 }} name="chatboxes" />
              <Input
                multiline={true}
                maxLength={200}
                maxHeight={200}
                placeholder={t('simple:aboutMaster')}
                onChangeText={(textValue) => setText(textValue)}
              />
            </Item>
            <Text allowFontScaling={false} style={[styles.describeText, { textAlign: 'right' }]}>
              {text.length}/200
            </Text>
          </ScrollView>
          <View style={styles.buttonsContainer}>
            <Button
              disabled={rating === 0}
              onPress={() => {
                setVisibleModal(false);
                sendReview(rating, text);
              }}
              buttonStyle={styles.button}
              title={t('simple:send')}
              containerStyle={{ marginTop: 5 }}
            />
            <Button
              onPress={() => {
                setVisibleModal(false);
                sendNotification(null);
              }}
              title={t('simple:cancel')}
              type="outline"
              titleStyle={{ color: '#c20021' }}
              buttonStyle={{
                borderColor: '#c20021',
                borderRadius: 5,
                padding: 10,
              }}
              containerStyle={{ marginTop: 5 }}
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    )
  );
};

const styles = StyleSheet.create({
  modalRoot: {
    width,
    height: height,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    justifyContent: 'flex-end',
  },
  title: {
    fontSize: getFontSize(20),
    width: '80%',
    marginBottom: 15,
    fontWeight: '500',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#c20021',
    borderRadius: 5,
    padding: 10,
  },
  icon: {
    width: 56,
    height: 56,
    alignSelf: 'center',
  },
  buttonsContainer: {
    paddingBottom: 40,
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
    backgroundColor: '#c20021',
    width: '100%',
    alignItems: 'center',
    textAlign: 'center',
    marginVertical: 5,
  },
});
