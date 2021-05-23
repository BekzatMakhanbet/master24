const initialState = {
  notifications: [],
}

const notificationReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_NOTIFICATION': {
      return {
        ...action.payload,
      }
    }
    default: {
      return state
    }
  }
}

export const selectedNotReducer = (state = null, action) => {
  switch (action.type) {
    case 'SET_SELECTED_NOTIFICATION': {
      return {
        ...action.payload,
      }
    }
    default: {
      return state
    }
  }
}

export const loadingReducer = (state = { loading: false }, action) => {
  switch (action.type) {
    case 'SET_LOADING': {
      return {
        ...action.payload,
      }
    }
    default: {
      return state
    }
  }
}

export default notificationReducer
