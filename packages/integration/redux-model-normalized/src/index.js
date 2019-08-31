import configureModels from '@request-kit/model-normalized';
import {
  reducer,
  selectDict,
  selectItem,
  selectList,
  selectMissingIds,
} from './state';
import dispatchEntitiesStrategyEnhancer from './strategyEnhancer';

export const setSelectorRoot = (wrappedSelector, selectorRoot) => (
  state,
  ...args
) => {
  let forwardedState;
  if (typeof selectorRoot === 'function') {
    forwardedState = selectorRoot(state);
  } else if (selectorRoot) {
    forwardedState = state[selectorRoot];
  } else {
    forwardedState = state;
  }
  return wrappedSelector(forwardedState, ...args);
};

const adoptEntitySelector = (selector, selectorRoot) => {
  const adoptedSelector = setSelectorRoot(selector, selectorRoot);
  adoptedSelector.bindModel = modelName => (state, ...args) =>
    adoptedSelector(state, modelName, ...args);
  return adoptedSelector;
};

export default ({ entitiesSelector: selectEntities, modelsConfig }) => {
  const { modelsNormalizedPlugin, denormalize } = configureModels(modelsConfig);

  const modelsStrategyEnhancer = requestHandler =>
    dispatchEntitiesStrategyEnhancer(modelsNormalizedPlugin(requestHandler));

  return {
    reducer,
    modelsStrategyEnhancer,
    selectors: {
      selectDict: adoptEntitySelector(selectDict, selectEntities),
      selectItem: adoptEntitySelector(selectItem, selectEntities),
      selectList: adoptEntitySelector(selectList, selectEntities),
      selectMissingIds: adoptEntitySelector(selectMissingIds, selectEntities),
    },
    denormalize: (state, requirements, result) =>
      denormalize(requirements, result, selectEntities(state)),
  };
};
