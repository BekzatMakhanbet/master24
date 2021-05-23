import hoistNonReactStatics from 'hoist-non-react-statics';
import { withTranslation } from 'react-i18next';

export default (component) => {
  return hoistNonReactStatics(withTranslation()(component), component);
};
