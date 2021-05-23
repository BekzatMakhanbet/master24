import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Camera } from 'expo-camera';
import * as Permissions from 'expo-permissions';
import { Spinner } from 'native-base';
import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, Modal, Text, TouchableOpacity, View } from 'react-native';

const { width, height } = Dimensions.get('window');

export const CameraComponent = ({ closeCamera, saveImage, index }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [visible, setVisible] = useState(true);
  const [spinning, setSpinning] = useState(false);

  const cameraRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { status } = await Permissions.askAsync(Permissions.CAMERA);
      setHasPermission(status === 'granted');
    })();
  }, []);

  const takePicture = async () => {
    if (cameraRef) {
      setSpinning(true);
      const options = { quality: 1, base64: false };
      const data = await cameraRef.current.takePictureAsync(options);
      saveImage(data, index);
      setSpinning(false);
      closeCamera();
    }
  };

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return (
      <Text
        allowFontScaling={false}
        style={{
          fontSize: 16,
          fontWeight: '500',
          marginVertical: 20,
          textAlign: 'center',
          color: '#999999',
        }}
      >
        Нет доступа к камере
      </Text>
    );
  }

  return (
    <Modal visible={visible} style={{ flex: 1 }}>
      <View style={{ height, width }}>
        <View style={{ height: height * 0.8, width }}>
          <Camera ref={cameraRef} style={{ flex: 1 }} type={type} />
        </View>
        <View
          style={{
            backgroundColor: 'black',
            flexDirection: 'row',
            width,
            justifyContent: 'space-around',
            alignItems: 'center',
            flex: 1,
          }}
        >
          <TouchableOpacity
            onPress={() => {
              setType(
                type === Camera.Constants.Type.back
                  ? Camera.Constants.Type.front
                  : Camera.Constants.Type.back,
              );
            }}
          >
            <MaterialCommunityIcons name="camera-switch" size={30} color="white" />
          </TouchableOpacity>
          {spinning ? (
            <Spinner />
          ) : (
            <TouchableOpacity onPress={() => takePicture()}>
              <MaterialCommunityIcons name="camera-iris" size={30} color="white" />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() => {
              setVisible(false);
              closeCamera();
            }}
          >
            <MaterialCommunityIcons name="close-outline" size={30} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
