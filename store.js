import { AsyncStorage } from 'react-native';
import { createStore, applyMiddleware } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import { syncLocalizationWithStore } from './i18n';

import rootReducer from './reducers/index';

const persistConfig = {
  // Root
  key: 'root',
  // Storage Method (React Native)
  storage: AsyncStorage,
  // Whitelist (Save Specific Reducers)
  whitelist: [
    'authReducer',
    'localReducer',
    'modeReducer',
    'notificationReducer',
    'appStateReducer',
  ],
  // Blacklist (Don't Save Specific Reducers)
  blacklist: [],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = createStore(persistedReducer, applyMiddleware());

let persistor = persistStore(store, {}, () => {
  syncLocalizationWithStore(store);
});

export { store, persistor };
