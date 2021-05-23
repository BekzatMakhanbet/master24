import React from 'react';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { Image, StyleSheet } from 'react-native';
import { useNavigation } from 'react-navigation-hooks';
import getFontSize from '../../utils/getFontSize';
import config from '../../config/config';
import increaseViewCount from '../../utils/increaseViewCount';

export default ({ promo, navigateScreen }) => {
  const navigation = useNavigation();

  const onPressPromo = () => {
    const { marketId } = promo;
    if (marketId) {
      increaseViewCount('BANNER_FOLLOW', promo.id);
      console.log(marketId, 'From Promo');

      navigation.navigate(navigateScreen, { marketId });
    }
  };

  return (
    <TouchableWithoutFeedback style={styles.view} onPress={onPressPromo}>
      <Image
        style={styles.image}
        resizeMode="contain"
        source={{
          uri: promo ? `${config.urlImage}${promo.image.imageName}` : config.defaultImage,
        }}
      />
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  image: { borderRadius: 10, paddingHorizontal: '5%', height: getFontSize(250) },
  view: { width: '95%', alignSelf: 'center' },
});
