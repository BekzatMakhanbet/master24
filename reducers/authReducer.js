const initialState = {
  loggedIn: false,
  name: null,
  surname: null,
  username: null,
  city: null,
  sex: null,
  id: null,
  master: null,
  token: null,
  avatar: null,
  specializations: [],
}
const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'LOGIN': {
      return {
        ...action.payload,
      }
    }
    default: {
      return state
    }
  }
}
export default authReducer
