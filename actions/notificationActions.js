export const addNotifications = (notifications) => ({
  type: 'SET_NOTIFICATION',
  payload: {
    notifications,
  },
})

export const clearAllNotifications = () => ({
  type: 'SET_NOTIFICATION',
  payload: {
    notifications: [],
  },
})

export const setSelectedNotification = (notification) => ({
  type: 'SET_SELECTED_NOTIFICATION',
  payload: {
    notification,
  },
})

export const setLoading = (loading) => ({
  type: 'SET_LOADING',
  payload: {
    loading,
  },
})
