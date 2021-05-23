const initialState = {
  activeTab: 0,
}
const activeTab = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_TAB': {
      return {
        ...action.payload,
      }
    }
    default: {
      return state
    }
  }
}
export default activeTab
