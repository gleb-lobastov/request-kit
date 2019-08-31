import { combineReducers } from 'redux';
import {
  distributeReducer,
  selectDomainState,
  selectDomainStates,
} from 'distribute-reducer';
import createReactReduxIntegration, {
  EMPTY_STATE,
} from '@request-kit/intg-react-redux';
import createReduxModelIntegration from '@request-kit/intg-redux-model-normalized';
import {
  multiRequestEnhancer,
  multiProvisionSelector,
  multiProvisionAdapter,
  multiCheckIsRequirementsChanged,
  mergeProvisionState,
} from '@request-kit/multiple-request';
import createRequestHandler from '@request-kit/request-default';

const STATE_PATHS = { ENTITIES: 'entities', PROVISION: 'provision' };
const compose = (...funcs) => arg =>
  funcs.reduceRight((composed, f) => f(composed), arg);

export default ({
  modelsConfig,
  requestHandlerConfig = {},
  requestHandler = createRequestHandler(requestHandlerConfig),
  requestKitStateKey = 'requestKit',
}) => {
  const selectEntities = state =>
    state[requestKitStateKey][STATE_PATHS.ENTITIES];
  const selectProvision = state =>
    state[requestKitStateKey][STATE_PATHS.PROVISION];

  const {
    selectors: entitiesSelectors,
    reducer: entitiesReducer,
    modelsStrategyEnhancer,
    denormalize,
    submit,
  } = createReduxModelIntegration({
    entitiesSelector: selectEntities,
    modelsConfig,
  });

  const provisionSelector = (state, requirements) => {
    const provisionState = selectProvision(state);
    const provision = multiProvisionSelector(
      provisionState,
      requirements,
      (domainComplexState, domain) =>
        selectDomainState(domainComplexState, domain, {
          emptyState: EMPTY_STATE,
        }),
    );
    const { noFallback } = requirements;
    const { value, fallback } = provision;
    return {
      provision,
      ...multiProvisionAdapter({
        originalAdapter: denormalize,
        provisionValues:
          noFallback || typeof value !== 'undefined' ? value : fallback,
        requirements,
        state,
      }),
    };
  };

  const {
    reducer: provisionReducer,
    selectors: provisionSelectors,
    strategyEnhancer: provisionStrategyEnhancer,
    createMiddleware: createReduxMiddleware,
    provide,
  } = createReactReduxIntegration({
    requirementsComparator: multiCheckIsRequirementsChanged,
    provisionSelector,
    stateSelector: (state, domain) =>
      selectDomainState(selectProvision(state), domain, {
        emptyState: EMPTY_STATE,
      }),
  });

  const requestStrategy = compose(
    multiRequestEnhancer,
    provisionStrategyEnhancer,
    modelsStrategyEnhancer,
  )(requestHandler);

  const reducer = combineReducers({
    [STATE_PATHS.ENTITIES]: entitiesReducer,
    [STATE_PATHS.PROVISION]: distributeReducer(provisionReducer),
  });

  return {
    reduxMiddleware: createReduxMiddleware({ requestStrategy }),
    provide,
    selectors: {
      ...entitiesSelectors,
      ...provisionSelectors,
      selectProvisionStatus: (state, domain, { excludeDomains = [] } = {}) => {
        const provisionState = selectProvision(state);
        return mergeProvisionState(
          selectDomainStates(provisionState, domain, {
            emptyState: EMPTY_STATE,
          }),
          particularDomain => !excludeDomains.includes(particularDomain),
        );
      },
    },
    reducer,
    submit,
  };
};
