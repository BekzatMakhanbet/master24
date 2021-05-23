import { PixelRatio } from 'react-native';

export default (originalSize) => {
  //Generate the Font Size or value by the screen Pixel Ratio to adaptive
  const pixel = PixelRatio.get();
  if (pixel < 1.5) {
    return (originalSize * 0.7) / pixel;
  } else if (pixel >= 1.5 && pixel < 2.5) {
    return (originalSize * 1.7) / pixel;
  } else if (pixel >= 2.5) {
    return (originalSize * 2.7) / pixel;
  } else {
    return originalSize;
  }
};
