import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  notFocused: {
    color: '#999999',
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: '500',
    fontSize: 15,
  },
  focused: {
    color: '#c20021',
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: '500',
    fontSize: 15,
  },
  notFocusedMaster: {
    color: '#999999',
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: '500',
    fontSize: 15,
  },
  focusedMaster: {
    color: '#0288c7',
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 10,
    fontSize: 15,
  },
  focusedDrawer: {
    color: '#c20021',
    marginTop: 30,
    fontWeight: '500',
    paddingTop: 10,
    paddingVertical: 15,
  },
  notFocusedDrawer: {
    color: 'black',
    marginTop: 30,
    fontWeight: '500',
    paddingTop: 10,
    paddingVertical: 15,
  },
});

export default styles;
