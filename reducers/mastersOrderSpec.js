const initialState = {
  specName: 'show',
  masterCount: '',
  marketCount: '',
  allMarketCount: '',
  specId: '',
};
const mastersOrderSpec = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_SPEC': {
      return {
        ...action.payload,
      };
    }
    case 'SET_MARKET_COUNT': {
      return { ...state, allMarketCount: action.payload.allMarketCount };
    }
    default: {
      return state;
    }
  }
};
export default mastersOrderSpec;
