import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Input, Image } from 'react-native-elements';
import { Badge } from 'native-base';
import { FontAwesome, Feather, AntDesign } from '@expo/vector-icons';
import config from '../../../config/config';
import stylesObject from '../../../constants/style/stylesObject';

export const ConfirmProfile = ({
  status,
  identificationPhotos,
  iin,
  iinValue,
  t,
  edit,
  setStateValues,
  _pickIdImage,
}) => {
  return (
    <View style={styles.view}>
      <View>
        <Text allowFontScaling={false} style={styles.labelInfo}>
          {t('simple:confirmDoc')}
        </Text>
        <Text allowFontScaling={false} style={styles.confirmDocText}>
          {t('simple:confirmDocText')}.
        </Text>
        <Text allowFontScaling={false} style={styles.iinLabel}>
          {t('simple:iin')}
        </Text>
        <Input
          keyboardType="numeric"
          editable={edit && status !== 'VERIFIED'}
          value={edit ? iinValue : iin}
          onChangeText={(value) => setStateValues('iin', value)}
          inputContainerStyle={styles.inputContainerStyle}
          rightIcon={
            edit && status !== 'VERIFIED' && <Feather color="#cadadd" name="x" size={26} />
          }
        />
      </View>
      <View style={styles.imagesView}>
        {identificationPhotos?.length > 0 ? (
          <View key={identificationPhotos[0].id} style={styles.imageView}>
            <View style={stylesObject.defaultFlexRowCentered}>
              <Image
                source={{
                  uri: `${config.url}/images/${identificationPhotos[0].imageName}`,
                }}
                style={styles.image}
              />
              <Text allowFontScaling={false}>{identificationPhotos[0].imageName}</Text>
            </View>
            {edit && status !== 'VERIFIED' && (
              <TouchableOpacity
                onPress={() => {
                  setStateValues('deleteImageId', identificationPhotos[0].id);
                  setStateValues('deleteImageModal', true);
                }}
              >
                <Badge style={stylesObject.defaultJustifyCenter}>
                  <FontAwesome name="trash-o" color={'#fff'} size={18} />
                </Badge>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={stylesObject.defaultFlexRowCentered}>
            <TouchableOpacity onPress={() => _pickIdImage()} style={styles.touchableOpacity}>
              <View style={styles.cameraView}>
                <AntDesign name="camerao" color={'#fff'} size={17} />
              </View>
            </TouchableOpacity>
            <Text allowFontScaling={false} style={styles.chooseText}>
              {t('simple:chooseForID')}
            </Text>
          </View>
        )}
        {identificationPhotos?.length > 1 ? (
          <View key={identificationPhotos[1].id} style={styles.imageView}>
            <View style={stylesObject.defaultFlexRowCentered}>
              <Image
                source={{
                  uri: `${config.url}/images/${identificationPhotos[1].imageName}`,
                }}
                style={styles.image}
              />
              <Text allowFontScaling={false}>{identificationPhotos[1].imageName}</Text>
            </View>
            {edit && status !== 'VERIFIED' && (
              <TouchableOpacity
                onPress={() => {
                  setStateValues('deleteImageId', identificationPhotos[1].id);
                  setStateValues('deleteImageModal', true);
                }}
              >
                <Badge style={stylesObject.defaultJustifyCenter}>
                  <FontAwesome name="trash-o" color={'#fff'} size={18} />
                </Badge>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={stylesObject.defaultFlexRowCentered}>
            <TouchableOpacity onPress={() => _pickIdImage()} style={styles.touchableOpacity}>
              <View style={styles.cameraView}>
                <AntDesign name="camerao" color={'#fff'} size={17} />
              </View>
            </TouchableOpacity>
            <Text allowFontScaling={false} style={styles.chooseText}>
              {t('simple:chooseForID2')}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  labelInfo: {
    textAlign: 'left',
    fontSize: 18,
    fontWeight: '500',
    marginTop: 7,
  },
  view: {
    width: '95%',
    paddingBottom: 5,
    paddingHorizontal: 5,
    alignSelf: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#cadadd',
  },
  confirmDocText: { color: '#b2bdbf', fontWeight: '400' },
  iinLabel: {
    color: '#b2bdbf',
    fontWeight: '500',
    fontSize: 16,
    marginLeft: 10,
  },
  inputContainerStyle: {
    width: '100%',
    borderBottomColor: '#cadadd',
    borderBottomWidth: 2,
  },
  imagesView: { width: '93%', alignSelf: 'center' },
  imageView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 7,
    alignItems: 'center',
  },
  image: {
    width: 60,
    height: 60,
    marginRight: 7,
    borderRadius: 20,
  },
  touchableOpacity: {
    width: 60,
    marginVertical: 7,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e9f0f4',
  },
  cameraView: {
    width: '40%',
    height: '40%',
    borderRadius: 100,
    backgroundColor: '#c20021',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chooseText: {
    width: '70%',
    marginLeft: 10,
    color: '#999999',
  },
});
