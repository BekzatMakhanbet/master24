import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    width: '100%',
    flex: 1,
  },
  input: {
    paddingLeft: 10,
    color: 'black',
    marginTop: 10,
  },

  inputContainer: {
    borderBottomWidth: 1,
    alignSelf: 'center',
    width: '95%',
    borderBottomColor: '#8b998f',
    marginVertical: 3,
  },
  masterRoot: {
    flex: 1,
    width: '100%',
  },
  specilization: {
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 19,
  },
  name: {
    fontWeight: '500',
    fontSize: 20,
    color: 'black',
    textAlign: 'center',
  },
  info: {
    fontWeight: '400',
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
  },

  textInfo: {
    color: 'black',
    fontWeight: '400',
    textAlign: 'left',
    marginVertical: 7,
  },
  button: {
    backgroundColor: '#0288c7',
    marginVertical: 7,
  },
  diamond: {
    width: 18,
    height: 18,
    backgroundColor: '#c20021',
    transform: [{ rotate: '45deg' }],
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressToChoose: { textAlign: 'center', color: '#999999' },
  segmentButton: {
    borderColor: 'transparent',
    width: '50%',
    height: 45,
  },
  segment: { backgroundColor: '#fff', width: '100%', marginTop: 10 },
  segmentTextActive: {
    color: '#fff',

    fontWeight: '500',
    textAlign: 'center',
    width: '100%',
  },
  segmentTextInactive: {
    color: '#999999',
    fontWeight: '500',
    textAlign: 'center',
    width: '100%',
  },
  segment1View: {
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 5,
    borderBottomWidth: 2,
    borderBottomColor: '#cadadd',
  },
  segmentBottomPadding: { paddingBottom: 55 },
  buttonInactive: {
    backgroundColor: '#e9f0f4',
  },
  profileMiddleView: {
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 5,
    borderBottomWidth: 2,
    borderBottomColor: '#cadadd',
  },
  labelInfo: {
    textAlign: 'left',
    fontSize: 18,
    fontWeight: '500',
    marginTop: 7,
  },
  componentsViewWrapper: {
    width: '95%',
    paddingBottom: 5,
    paddingHorizontal: 5,
    alignSelf: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#cadadd',
  },
});
