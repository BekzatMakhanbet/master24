const HEADER_COLOR_CLIENT = '#c20021';
const HEADER_COLOR_MASTER = '#0288c7';

const HEADER_COLOR_CLIENT_LESS = '#eaa8b3';
const HEADER_COLOR_MASTER_LESS = '#91ceeb';

export const getModeColor = (mode) => {
  return mode === 'client' ? HEADER_COLOR_CLIENT : HEADER_COLOR_MASTER;
};
export const getModeColorOpacityLess = (mode) => {
  return mode === 'client' ? HEADER_COLOR_CLIENT_LESS : HEADER_COLOR_MASTER_LESS;
};
