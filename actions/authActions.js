export const login = (
  trueFalse,
  name,
  surname,
  sex,
  city,
  username,
  id,
  master,
  token,
  avatar,
  specializations,
) => ({
  type: 'LOGIN',
  payload: {
    name,
    surname,
    sex,
    city,
    username,
    id,
    master,
    token,
    loggedIn: trueFalse,
    avatar,
    specializations,
  },
});

export const logout = () => ({
  type: 'LOGIN',
  payload: {
    name: null,
    surname: null,
    sex: null,
    city: null,
    username: null,
    id: null,
    master: null,
    token: null,
    loggedIn: false,
    avatar: null,
    specializations: [],
  },
});
