export const setSpecName = (specName, masterCount, marketCount, specId) => ({
  type: 'SET_SPEC',
  payload: {
    specName: specName,
    masterCount,
    marketCount,
    specId,
  },
});

export const setMarketCount = (marketCount) => ({
  type: 'SET_MARKET_COUNT',
  payload: {
    allMarketCount: marketCount,
  },
});
