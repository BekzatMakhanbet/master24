import { AntDesign } from '@expo/vector-icons';
import { View } from 'native-base';
import React, { Fragment, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import { store } from '../../store';
import { getModeColor } from '../../utils/getModeColor';
import increaseViewCount from '../../utils/increaseViewCount';
import config from '../../config/config';

const { width, height } = Dimensions.get('window');

export const ProductList = ({ category, marketPhone, pressCall, marketId }) => {
  const [productsModal, setProductsModal] = useState(false);
  return (
    <Fragment>
      <TouchableOpacity
        onPress={() => {
          increaseViewCount('PRODUCT', marketId);
          setProductsModal(true);
        }}
        style={{ marginBottom: 10 }}
      >
        <Image
          source={{
            uri: category.image && `${config.url}/images/${category.image.imageName}`,
          }}
          style={{ width: width / 4, height: width / 4, marginRight: 10 }}
        />
        <Text allowFontScaling={false} style={{ textAlign: 'center', width: width / 4 }}>
          {category.categoryName}
        </Text>
      </TouchableOpacity>
      <Modal animationType="fade" transparent={true} visible={productsModal}>
        <View style={styles.modalRoot}>
          <View
            style={{
              backgroundColor: getModeColor(store.getState().modeReducer.mode),
              paddingTop: 20,
            }}
          >
            <Text allowFontScaling={false} style={styles.title}>
              {category.categoryName}
            </Text>
            <TouchableOpacity
              style={{ position: 'absolute', right: '5%', top: 38 }}
              onPress={() => setProductsModal(false)}
            >
              <AntDesign name="closecircleo" size={23} color="white" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={category.products}
            renderItem={({ item }) => (
              <Product product={item} marketPhone={marketPhone} pressCall={pressCall} />
            )}
            keyExtractor={(item) => `${item.id}`}
            ListEmptyComponent={
              <Text
                allowFontScaling={false}
                style={{
                  textAlign: 'center',
                  color: '#b2bdbf',
                  fontSize: 16,
                  fontWeight: '500',
                  marginTop: 20,
                }}
              >
                Нет товаров
              </Text>
            }
          />
        </View>
      </Modal>
    </Fragment>
  );
};

const Product = ({ product, marketPhone, pressCall }) => {
  return (
    <View style={styles.productRoot}>
      <Image
        // source={`${config.url}/images/${prodct.image.imageName}`}
        source={{
          uri: product.image
            ? `${config.url}/images/${product.image.imageName}`
            : config.defaultImage,
        }}
        style={styles.productImage}
        resizeMode="contain"
      />
      <View style={styles.productDescriptionView}>
        <View>
          <Text
            allowFontScaling={false}
            style={{
              fontSize: 17,
              maxWidth: '100%',
              fontWeight: '500',
              flexShrink: 1,
            }}
          >
            {product.productName} | {product.cost}₸
          </Text>
          <Text allowFontScaling={false} style={{ maxWidth: '100%', flexShrink: 1 }}>
            {product.description}
          </Text>
        </View>
        {/* <TouchableOpacity
          onPress={() => pressCall(marketPhone)}
          style={styles.callButton}
        >
          <AntDesign name={'phone'} size={26} color="green" />
        </TouchableOpacity> */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  modalRoot: {
    width,
    height: height,
    paddingBottom: 20,
    backgroundColor: '#fff',
  },
  title: {
    textAlign: 'center',
    fontSize: 21,
    fontWeight: '500',
    marginVertical: 15,
    width: '80%',
    alignSelf: 'center',
    color: '#fff',
  },
  productRoot: {
    backgroundColor: '#fff',
    borderRadius: 10,
    width: '90%',
    alignSelf: 'center',
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  productImage: {
    width: '100%',
    height: width * 0.6,
  },
  productDescriptionView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  callButton: {
    borderRadius: 100,
    width: 50,
    height: 50,
    backgroundColor: '#fff',
    padding: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
