import { compose } from 'redux';
import configureModels, { IModelsConfig } from '@request-kit/model-normalized';
import {
  reducer,
  selectDict,
  selectItem,
  selectList,
  selectMissingIds,
} from './state';
import dispatchEntitiesStrategyEnhancer from './strategyEnhancer';
import {
  IReduxModelNormalizedConfig,
  ISelector,
  IAdoptedSelector,
} from './interface';

export interface IModelsConfig extends IModelsConfig {}

export const setSelectorRoot = (
  wrappedSelector: ISelector,
  selectorRoot: string,
): ISelector => (state: { [selectorRoot: string]: object }, ...args: any[]) => {
  const forwardedState = selectorRoot ? state[selectorRoot] : state;
  return wrappedSelector(forwardedState, ...args);
};

const adoptEntitySelector = (
  selector: ISelector,
  selectorRoot: string,
): IAdoptedSelector => {
  const adoptedSelector = setSelectorRoot(
    selector,
    selectorRoot,
  ) as IAdoptedSelector;
  adoptedSelector.bindModel = modelName => (state, ...args) =>
    adoptedSelector(state, modelName, ...args);
  return adoptedSelector;
};

export default ({
  entitiesSelectorRoot,
  modelsConfig,
}: IReduxModelNormalizedConfig) => {
  const {
    strategyEnhancer: splitModelQueriesStrategyEnhancer,
    requestEnhancer: normalizeModelResponseRequestEnhancer,
  } = configureModels(modelsConfig);

  const strategyEnhancer = compose(
    splitModelQueriesStrategyEnhancer,
    dispatchEntitiesStrategyEnhancer,
  );

  return {
    reducer,
    strategyEnhancer,
    requestEnhancer: normalizeModelResponseRequestEnhancer,
    selectors: {
      selectDict: adoptEntitySelector(selectDict, entitiesSelectorRoot),
      selectItem: adoptEntitySelector(selectItem, entitiesSelectorRoot),
      selectList: adoptEntitySelector(selectList, entitiesSelectorRoot),
      selectMissingIds: adoptEntitySelector(
        selectMissingIds,
        entitiesSelectorRoot,
      ),
    },
  };
};
