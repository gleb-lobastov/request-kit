import createDistributor from '@request-kit/distribute-reducer';
import createRequestEngine from '@request-kit/engine-rest';
import createReactReduxIntegration, {
  State,
} from '@request-kit/intg-react-redux';

interface ReactReduxPresetOptions {
  distributorConfig?: object;
  requestEngineConfig: { plugins: any[] };
  selectorRoot?: string;
}

const setSelectorRoot = (wrappedSelector: Function, selectorRoot: string) => (
  state: State,
  ...args: any[]
) => {
  const forwardedState = selectorRoot ? state[selectorRoot] : state;
  return wrappedSelector(forwardedState, ...args);
};

export default ({
  requestEngineConfig,
  distributorConfig,
  selectorRoot = 'requestKit',
}: ReactReduxPresetOptions) => {
  const engine = createRequestEngine(requestEngineConfig);

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
      strategyEnhancer: x => x,
    },
    providerOptions: {
      provisionSelector: setSelectorRoot(selectDomainState, selectorRoot),
    },
  });

  return {
    reduxMiddleware,
    provide,
    reducer: distributeReducer(provisionReducer),
  };
};
