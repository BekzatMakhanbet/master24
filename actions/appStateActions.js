export const changeAppState = (client, master) => ({
  type: 'SET_APP_STATE',
  payload: {
    firstClient: client,
    firstMaster: master,
  },
})
