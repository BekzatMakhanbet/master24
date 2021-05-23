import { Platform } from 'react-native';

export default Platform.select({
  web: { headerMode: 'screen' },
  default: {
    headerLayoutPreset: 'center',
    headerMode: 'screen',
  },
});
