import { connect } from 'react-redux';
import createProvider from '@request-kit/provision-react';
import {
  createRequestAction,
  requestSelectors,
} from '@request-kit/controller-redux';
import { memoizeByLastArgs } from './memo';

const compose = (...funcs: Function[]) => (arg: any) =>
  funcs.reduceRight((composed, f) => f(composed), arg);

type Optional<T> = T | undefined;

export interface State {
  [key: string]: any;
}
export type ProvisionStateSelector = string | Function;
type DomainStateSelector = ((state: State, domain: string) => Optional<State>);
type ResolvedProvisionStateSelector = ((state: State) => State);
type ResolveProvisionStateSelector = (
  provisionStateSelector: ProvisionStateSelector,
) => ResolvedProvisionStateSelector;

const resolveProvisionStateSelector: ResolveProvisionStateSelector = (
  provisionStateSelector: ProvisionStateSelector,
) => (state: State) => {
  if (!provisionStateSelector) {
    return state;
  }
  if (typeof provisionStateSelector === 'function') {
    return provisionStateSelector(state);
  }
  return state[provisionStateSelector];
};

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

const provideHocInternal = createProvider({
  requireProvision: ({ requirements, dispatch }: ICallbackProps) =>
    dispatch(createRequestAction(requirements)),
  resolveProvision: ({ provision }: ICallbackProps) => (
    console.log('h', provision), provision
  ),
  requirementsComparator: (
    { query: queryA, meta: { domain: domainA } }: RequestParams,
    { query: queryB, meta: { domain: domainB } }: RequestParams,
  ) => domainA === domainB && queryA === queryB,
});

const resolveProvision = memoizeByLastArgs((domainState = {}) => ({
  isComplete: requestSelectors.selectIsReady(domainState),
  isPending: requestSelectors.selectIsPending(domainState),
  error: requestSelectors.selectError(domainState),
  fallback: requestSelectors.selectAvailableResult(domainState),
  value: requestSelectors.selectRelevantResult(domainState),
}));

export interface ProviderOptions {
  selectDomainState: DomainStateSelector;
  provisionStateSelector?: ProvisionStateSelector;
}

type MapStateToRequirements = (state: State, props?: {}) => Requirements;

export default ({
  selectDomainState,
  provisionStateSelector = 'provision',
}: ProviderOptions) => {
  const selectProvisionState = resolveProvisionStateSelector(
    provisionStateSelector,
  );
  // returns "provide" high-order component, adapted for react-redux stack
  return (mapStateToRequirements: MapStateToRequirements) => {
    const mapStateToProps = (state: State, props?: {}) => {
      const requirements = mapStateToRequirements(state, props) || {};
      const { meta: { domain = '' } = {} } = requirements;
      console.log(
        resolveProvision(
          selectDomainState(selectProvisionState(state), domain),
        ),
      );
      return {
        requirements,
        provision: resolveProvision(
          selectDomainState(selectProvisionState(state), domain),
        ),
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
        provideHocInternal,
      )(WrappedComponent);
  };
};
