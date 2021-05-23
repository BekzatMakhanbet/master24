import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import stylesObject from '../../../constants/style/stylesObject';
import { Badge, ActionSheet } from 'native-base';
import { FontAwesome, AntDesign } from '@expo/vector-icons';
import { Image } from 'react-native-elements';
import config from '../../../config/config';
import getFontSize from '../../../utils/getFontSize';

const { width } = Dimensions.get('window');

export const WorkPhotos = ({
  t,
  edit,
  setStateValues,
  worksPhotos,
  openImageView,
  _pickWorkImage,
}) => {
  return (
    <View style={styles.view}>
      <Text allowFontScaling={false} style={styles.labelInfo}>
        {t('profile:workPhotos')} ({worksPhotos ? worksPhotos.length : 0})
      </Text>
      <View style={styles.imagesGridView95}>
        {worksPhotos?.length > 0 &&
          worksPhotos.map((photo, index) => {
            return (
              <View key={index} style={stylesObject.defaultFlexRow}>
                <TouchableOpacity onPress={() => openImageView(index)}>
                  {edit && (
                    <TouchableOpacity
                      onPress={() => {
                        setStateValues('deleteImageId', photo.id);
                        setStateValues('deleteImageModal', true);
                      }}
                    >
                      <Badge style={styles.deleteBadge}>
                        <FontAwesome name="trash-o" color={'#fff'} size={18} />
                      </Badge>
                    </TouchableOpacity>
                  )}
                  <Image
                    source={{
                      uri: `${config.url}/images/${photo.imageName}`,
                    }}
                    style={edit ? styles.imageLess : styles.imageBig}
                  />
                </TouchableOpacity>
              </View>
            );
          })}
        <TouchableOpacity
          onPress={() => {
            ActionSheet.show(
              {
                options: [t('simple:selectFromGallery'), t('simple:makePhoto'), t('simple:close')],
                cancelButtonIndex: 2,
                title: t('simple:addPhoto'),
              },
              (buttonIndex) => {
                if (buttonIndex === 0) {
                  _pickWorkImage();
                } else if (buttonIndex === 1) {
                  setStateValues('cameraWorkPhoto', true);
                }
              },
            );
          }}
          style={edit ? styles.addButtonEdit : styles.addButtonNoEdit}
        >
          <View style={styles.cameraView}>
            <AntDesign name="camerao" color={'#fff'} size={20} />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  view: {
    width: '98%',
    paddingBottom: 5,
    paddingHorizontal: 5,
    alignSelf: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#cadadd',
  },
  labelInfo: {
    textAlign: 'left',
    fontSize: 18,
    fontWeight: '500',
    marginTop: 7,
  },
  imagesGridView95: {
    alignSelf: 'center',
    flexWrap: 'wrap',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    width: '95%',
    paddingVertical: 10,
  },
  imagesGridView90: {
    alignSelf: 'center',
    flexWrap: 'wrap',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    width: '90%',
    paddingVertical: 10,
  },
  deleteBadge: {
    marginLeft: width / 6 + 7,
    marginBottom: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageLess: {
    width: width / 5,
    height: width / 5,
    marginRight: getFontSize(10),
    marginTop: getFontSize(10),
  },
  imageBig: {
    width: width / 4.2,
    height: width / 4.2,
    marginRight: getFontSize(10),
    marginTop: getFontSize(10),
  },
  cameraView: {
    width: '30%',
    height: '30%',
    borderRadius: 100,
    backgroundColor: '#c20021',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonEdit: {
    marginTop: 30,
    width: width / 5,
    height: width / 5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e9f0f4',
  },
  addButtonNoEdit: {
    marginTop: 0,
    width: width / 4.2,
    height: width / 4.2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e9f0f4',
  },
});
