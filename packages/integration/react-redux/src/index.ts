import { connect as originalConnect, Connect } from 'react-redux';
import createReactProvider from '@request-kit/provision-react';
import {
  createRequestAction,
  requestSelectors,
  createRequestMiddleware,
  createRequestReducer,
} from '@request-kit/controller-redux';
import { memoizeByLastArgs } from './memo';

const compose = (...funcs: Function[]) => (arg: any) =>
  funcs.reduceRight((composed, f) => f(composed), arg);

type Optional<T> = T | undefined;

export interface State {
  [key: string]: any;
}
export interface Action {
  type: string | symbol;
}
export interface Strategy {
  (
    requirements: Requirements,
    dispatch: (action: Action) => any,
    getState: () => State,
  ): Promise<any>;
}
export interface ControllerOptions {
  requestHandler: (requirements: object) => Promise<any>;
  strategyEnhancer?: (strategy: Strategy) => Strategy;
}

type DomainStateSelector = (state: State, domain: string) => Optional<State>;

export interface Provision {
  isComplete: boolean;
  isPending: boolean;
  error: Error;
  fallback: any;
  value: any;
}

export interface RequestParams {
  query: string;
  meta: {
    domain: string;
  };
}

type Requirements = any;

type ICallbackProps = {
  requirements: Requirements;
  dispatch: Function;
  provision: any;
};

export interface ProviderOptions {
  provisionSelector: DomainStateSelector;
  connect?: Connect;
}

export interface IntegrationOptions {
  middlewareOptions: ControllerOptions;
  reducerOptions?: object;
  providerOptions: ProviderOptions;
}

type MapStateToRequirements = (state: State, props?: {}) => Requirements;

const requirementsComparator = (
  requirementsA: RequestParams,
  requirementsB: RequestParams,
) => {
  if (!requirementsA && !requirementsB) {
    return true;
  }
  if (Boolean(requirementsA) !== Boolean(requirementsB)) {
    return false;
  }

  const {
    query: queryA,
    meta: { domain: domainA },
  } = requirementsA;
  const {
    query: queryB,
    meta: { domain: domainB },
  } = requirementsB;

  return domainA === domainB && queryA === queryB;
};

const provideInternal = createReactProvider({
  requireProvision: ({ requirements, dispatch }: ICallbackProps) =>
    dispatch(createRequestAction(requirements)),
  resolveProvision: ({ provision }: ICallbackProps) => provision,
  requirementsComparator,
});

const createReactReduxProvider = ({
  provisionSelector,
  connect = originalConnect,
}: ProviderOptions) => (mapStateToRequirements: MapStateToRequirements) => {
  const selectProvision = memoizeByLastArgs((state = {}) => ({
    isComplete: requestSelectors.selectIsReady(state),
    isPending: requestSelectors.selectIsPending(state),
    error: requestSelectors.selectError(state),
    fallback: requestSelectors.selectAvailableResult(state),
    value: requestSelectors.selectRelevantResult(state),
  }));

  const mapStateToProps = (state: State, props?: {}) => {
    const fulfilledRequirements = requestSelectors.selectIsFulfilled(state)
      ? requestSelectors.selectRequirements(state)
      : null;
    const requirements = mapStateToRequirements(state, props) || {};
    const { meta: { domain = '' } = {} } = requirements;
    return {
      fulfilledRequirements,
      requirements,
      provision: selectProvision(provisionSelector(state, domain)),
    };
  };

  // react-redux perform optimization when props is not used in state calculation
  // usage of props is determined through mapper func arity
  const actualMapStateToProps =
    mapStateToRequirements.length === 1
      ? (state: State) => mapStateToProps(state)
      : mapStateToProps;

  return (WrappedComponent: any) =>
    compose(
      connect(actualMapStateToProps),
      provideInternal,
    )(WrappedComponent);
};

export default ({
  middlewareOptions,
  reducerOptions,
  providerOptions,
}: IntegrationOptions) => ({
  reducer: createRequestReducer(/* reducerOptions */),
  middleware: createRequestMiddleware(middlewareOptions),
  provide: createReactReduxProvider(providerOptions),
});
