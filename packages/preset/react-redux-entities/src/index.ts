import { combineReducers, Reducer } from 'redux';
import createDistributor from '@request-kit/distribute-reducer';
import createRequestEngine from '@request-kit/engine-rest';
import createReactReduxIntegration from '@request-kit/intg-react-redux';
import createReduxModelNormalizedIntegration, {
  setSelectorRoot,
} from '@request-kit/intg-redux-model-normalized';
import { IReactReduxEntitiesPresetOptions } from './interface';

// domain: {
//    key: { type: 'fetch', model: 'model', schema: 'list', result: '' }
// }

const STATE_PATHS = { ENTITIES: 'entities', PROVISION: 'provision' };

// const setSelectorRoot = (wrappedSelector: Function, selectorRoot: string) => (
//   state: State,
//   ...args: any[]
// ) => {
//   const forwardedState = selectorRoot ? state[selectorRoot] : state;
//   return wrappedSelector(forwardedState, ...args);
// };

export default ({
  modelsConfig,
  requestEngineConfig = {},
  distributorConfig = {},
  selectorRoot = 'requestKit',
}: IReactReduxEntitiesPresetOptions) => {
  const entitiesSelectorRoot = `${selectorRoot}.${STATE_PATHS.ENTITIES}`;
  const provisionSelectorRoot = `${selectorRoot}.${STATE_PATHS.PROVISION}`;

  const {
    selectors: entitiesSelectors,
    reducer: entitiesReducer,
    strategyEnhancer: modelsStrategyEnhancer,
    requestEnhancer: modelsRequestEnhancer,
  } = createReduxModelNormalizedIntegration({
    entitiesSelectorRoot,
    modelsConfig,
  });

  const originalEnginePlugins = requestEngineConfig.plugins || [];
  const engine = createRequestEngine({
    ...requestEngineConfig,
    plugins: [modelsRequestEnhancer, ...originalEnginePlugins],
  });

  const { distributeReducer, selectDomainState } = createDistributor(
    distributorConfig,
  );
  const {
    reducer: provisionReducer,
    middleware: reduxMiddleware,
    provide,
  } = createReactReduxIntegration({
    middlewareOptions: {
      requestHandler: (...args) => engine.request(...args),
      // @ts-ignore
      strategyEnhancer: modelsStrategyEnhancer,
    },
    providerOptions: {
      provisionSelector: setSelectorRoot(
        selectDomainState,
        provisionSelectorRoot,
      ),
    },
  });

  return {
    reduxMiddleware,
    provide,
    selectors: entitiesSelectors,
    reducer: combineReducers({
      [STATE_PATHS.ENTITIES]: entitiesReducer,
      [STATE_PATHS.PROVISION]: distributeReducer(provisionReducer) as Reducer, // todo remove as Reducer
    }),
  };
};
