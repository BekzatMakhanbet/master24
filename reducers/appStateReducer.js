const appStateReducer = (
  state = { firstClient: false, firstMaster: false },
  action
) => {
  switch (action.type) {
    case 'SET_APP_STATE':
      return {
        ...action.payload,
      }
    default:
      return state
  }
}

export default appStateReducer
