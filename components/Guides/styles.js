import { StyleSheet } from 'react-native';
import getFontSize from '../../utils/getFontSize';
import { getModeColor } from '../../utils/getModeColor';

export default StyleSheet.create({
  title: {
    fontSize: getFontSize(18),
    fontWeight: '500',
    paddingLeft: 5,
  },
  titleCentered: {
    fontSize: getFontSize(18),
    fontWeight: '500',
    paddingVertical: 15,
    textAlign: 'center',
  },
  text: {
    fontSize: getFontSize(16),
    marginVertical: 5,
    paddingLeft: 5,
    flex: 1,
    flexWrap: 'wrap',
  },
  textUnderlined: {
    fontSize: getFontSize(16),
    marginVertical: 5,
    paddingLeft: 5,
    textDecorationLine: 'underline',
  },
  contentStyle: {
    paddingHorizontal: 10,
    paddingTop: 40,
    paddingBottom: 20,
  },
  buttonClient: {
    backgroundColor: getModeColor('client'),
    width: '100%',
    alignItems: 'center',
    textAlign: 'center',
    marginVertical: 5,
  },
  buttonMaster: {
    backgroundColor: getModeColor('master'),
    width: '100%',
    alignItems: 'center',
    textAlign: 'center',
    marginVertical: 5,
  },
  buttonText: {
    width: '100%',
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
  },
  flowAround: { flex: 1 },
  icons: { width: 25, height: 25, tintColor: getModeColor('master') },
  images: { width: 125, height: 125, margin: 10 },
});
