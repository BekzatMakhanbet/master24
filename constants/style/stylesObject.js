import { StyleSheet, Dimensions } from 'react-native';

const { height } = Dimensions.get('window');

export default StyleSheet.create({
  defaultContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    width: '100%',
    height,
  },
  defaultFlexOne: { flex: 1, alignItems: 'center' },
  defaultWidth100Centered: {
    width: '100%',
    alignSelf: 'center',
    alignItems: 'center',
  },
  defaultJustifyCenter: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  defaultWidth100: { width: '100%' },
  defaultFlexRow: { flexDirection: 'row' },
  defaultFlexRowCentered: { flexDirection: 'row', alignItems: 'center' },
  defaultFlexAllCentered: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  defaultColorRed: { color: 'red' },
  width100: { width: '100%' },
  font14: { fontSize: 14 },
  font15: { fontSize: 15 },
  font500: { fontWeight: '500' },
  marginVert10: { marginVertical: 10 },
  drawerOpenButton: { paddingLeft: 10, width: 80 },
  paddingRight15: { paddingRight: 15 },
});
