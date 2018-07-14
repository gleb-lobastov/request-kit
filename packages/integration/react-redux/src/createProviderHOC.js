import { connect } from 'react-redux';
import createProvider from '@request-kit/provision-react';
import {
  createRequestAction,
  requestSelectors,
} from '@request-kit/controller-redux';

const compose = (...funcs) => arg =>
  funcs.reduceRight((composed, f) => f(composed), arg);

const resolveProvisionStateSelector = provisionStateSelector => {
  if (!provisionStateSelector) {
    return state => state;
  }
  if (typeof provisionStateSelector === 'string') {
    const pathSteps = provisionStateSelector.split('.');
    return state =>
      pathSteps.reduce(
        (stateInterim, key) => stateInterim && stateInterim[key],
        state,
      );
  }
  return provisionStateSelector;
};

export default ({
  selectDomainState,
  provisionStateSelector = 'provision',
}) => {
  const selectProvisionState = resolveProvisionStateSelector(
    provisionStateSelector,
  );
  const provideHocInternal = createProvider({
    requireProvision: (requirements, { dispatch }) =>
      dispatch(createRequestAction(requirements)),
    resolveProvision: (requirements, { provision }) => provision,
    shouldSpreadProvisionInWrapperProps: true,
  });

  // returns "provide" high-order component, adapted for react-redux stack
  return mapStateToRequirements => {
    const mapStateToProps = (state, props) => {
      const requirements = mapStateToRequirements(state, props) || {};
      const { meta: { domain } = {} } = requirements;

      const domainState =
        selectDomainState(selectProvisionState(state), domain) || {};
      const provision = {
        isComplete: requestSelectors.selectIsReady(domainState),
        isPending: requestSelectors.selectIsPending(domainState),
        error: requestSelectors.selectError(domainState),
        fallback: requestSelectors.selectAvailableResult(domainState),
        provision: requestSelectors.selectRelevantResult(domainState),
      };

      return {
        requirements,
        provision,
      };
    };

    const actualMapStateToProps =
      mapStateToRequirements.length === 1
        ? state => mapStateToProps(state)
        : mapStateToProps;

    return Component =>
      compose(connect(actualMapStateToProps), provideHocInternal())(Component);
  };
};
