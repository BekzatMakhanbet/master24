import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ActionSheet } from 'native-base';
import { Avatar } from 'react-native-elements';

export const UserAvatar = ({ edit, avatar, userAvatar, t, setStateValues, _pickImage }) => {
  return (
    <View style={styles.view}>
      <Avatar
        rounded
        onPress={() => {
          edit
            ? ActionSheet.show(
                {
                  options: [
                    t('simple:selectFromGallery'),
                    t('simple:makePhoto'),
                    t('simple:close'),
                  ],
                  cancelButtonIndex: 2,
                  title: t('simple:addPhoto'),
                },
                (buttonIndex) => {
                  if (buttonIndex === 0) {
                    _pickImage();
                  } else if (buttonIndex === 1) {
                    setStateValues('camera', true);
                  }
                },
              )
            : setStateValues('visibleAvatar', true);
        }}
        size="xlarge"
        source={{
          uri: edit ? (avatar === '' ? userAvatar : avatar) : userAvatar,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  view: { justifyContent: 'flex-start', alignItems: 'center' },
});
