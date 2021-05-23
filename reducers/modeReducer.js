const initialState = {
  mode: 'client',
};
const modeReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SWITCH_MODE': {
      return {
        ...state,
        mode: state.mode === 'client' ? 'master' : 'client',
      }
    }
    default: {
      return state;
    }
  }
};

export default modeReducer;