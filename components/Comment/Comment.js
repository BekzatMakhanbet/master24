import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Avatar, Rating } from 'react-native-elements';
import getDateByMonth from '../../utils/getDateByMonth';
import config from '../../config/config';

const Comment = ({ text, person, data, grade }) => {
  const [more, setMore] = useState(false);
  const { t } = useTranslation();

  return (
    <View style={styles.root}>
      <View style={styles.personContainer}>
        <Avatar
          size="small"
          rounded
          source={{
            uri: person.avatar
              ? `${config.url}/images/${person.avatar.imageName}`
              : 'https://media.istockphoto.com/photos/icon-of-a-businessman-avatar-or-profile-pic-picture-id474001892?k=6&m=474001892&s=612x612&w=0&h=6g0M3Q3HF8_uMQpYbkM9XAAoEDym7z9leencMcC4pxo=',
          }}
        />
        <Text allowFontScaling={false} style={styles.name}>
          {person.firstName} {person.lastName}
        </Text>
      </View>
      <View style={styles.personContainer}>
        <Rating imageSize={20} readonly startingValue={grade} style={{ alignSelf: 'flex-start' }} />
        <Text allowFontScaling={false} style={styles.date}>
          {' '}
          | {getDateByMonth(data)}
        </Text>
      </View>
      <View style={styles.messageContainer}>
        <Text allowFontScaling={false} style={{ fontSize: 15 }}>
          {more ? text : text.substring(0, 100)}
        </Text>
        {text.length > 100 && (
          <TouchableOpacity onPress={() => setMore(!more)}>
            <Text allowFontScaling={false} style={styles.buttonText}>
              {more ? t('simple:hide') : t('simple:readAll')}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    paddingHorizontal: '5%',
    paddingVertical: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#cadadd',
  },
  name: {
    fontWeight: '500',
    fontSize: 18,
    marginLeft: 5,
  },
  date: {
    fontSize: 16,
    color: '#999999',
    marginLeft: 3,
  },
  personContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  messageContainer: {
    backgroundColor: '#e3f7ff',
    borderRadius: 5,
    paddingLeft: 10,
    paddingRight: 30,
    paddingVertical: 10,
  },
  buttonText: {
    color: '#c20021',
    textDecorationLine: 'underline',
    fontSize: 16,
  },
});

export default Comment;
