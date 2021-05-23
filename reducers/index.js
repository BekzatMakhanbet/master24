import { combineReducers } from 'redux'
import authReducer from './authReducer'
import modeReducer from './modeReducer'
import localReducer from './localReducer'
import mastersOrderSpec from './mastersOrderSpec'
import notificationReducer, {
  selectedNotReducer,
  loadingReducer,
} from './notificationReducer'
import appStateReducer from './appStateReducer'
import activeTab from './MyOrdersTabStateReducer'

const rootReducer = combineReducers({
  authReducer: authReducer,
  modeReducer: modeReducer,
  localReducer: localReducer,
  mastersOrderSpec: mastersOrderSpec,
  notificationReducer: notificationReducer,
  selectedNotReducer: selectedNotReducer,
  appStateReducer: appStateReducer,
  loadingReducer: loadingReducer,
  activeTab: activeTab,
})

export default rootReducer
