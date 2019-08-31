import { connect as originalConnect } from 'react-redux';
import createReactProvider from '@request-kit/provision-react';
import {
  selectError,
  selectIsError,
  selectIsPending,
  selectIsReady,
  selectIsUnsent,
  selectIsValid,
  selectLastError,
  selectPlaceholder,
  selectReadyState,
  selectResult,
  createRequestAction,
  createInvalidateRequestAction,
  strategyEnhancer,
  createMiddleware,
  createReducer as createRequestReducer,
} from '@request-kit/controller-redux';

const compose = (...funcs) => (...args) => {
  const lastFn = funcs[funcs.length - 1] || (arg => arg);
  return funcs
    .slice(0, -1)
    .reduceRight((composed, f) => f(composed), lastFn(...args));
};

const createReactReduxProvider = ({
  provisionSelector: mapStateToProvision,
  requirementsComparator: compareRequirements,
  connect = originalConnect,
}) => (
  mapStateToRequirements,
  originalMapStateToProps,
  _, // currently mapDispatchToProps is unsupported
  ...forwardedParams
) => {
  let prevProvisionPropsMapping;
  const mapStateToProps = (state, props) => {
    const originalPropsMapping = originalMapStateToProps
      ? originalMapStateToProps(state, props)
      : undefined;

    const actualProps = originalPropsMapping
      ? { ...props, ...originalPropsMapping }
      : props;

    const requirements = {
      ...mapStateToRequirements(state, actualProps, prevProvisionPropsMapping),
      isProvision: true,
    };

    const provisionPropsMapping = mapStateToProvision(state, requirements);
    prevProvisionPropsMapping = provisionPropsMapping;
    return {
      ...originalPropsMapping,
      requirements,
      ...provisionPropsMapping,
    };
  };

  // react-redux perform optimization when props is not used in state calculation
  // usage of props is determined through mapper func arity
  const canOptimize =
    mapStateToRequirements.length === 1 &&
    (!originalMapStateToProps || originalMapStateToProps.length <= 1);

  const actualMapStateToProps = canOptimize
    ? state => mapStateToProps(state)
    : mapStateToProps;

  return WrappedComponent =>
    compose(
      connect(
        actualMapStateToProps,
        null, // dispatch method should be accessible through props
        ...forwardedParams,
      ),
      createReactProvider({
        requirementsComparator: compareRequirements,
        // for provider internal use
        request: ({ dispatch, requirements }) =>
          dispatch(createRequestAction(requirements)),
        transformProps: ({ dispatch, requirements, provision, ...props }) => ({
          ...props,
          provision,
          invalidateRequest: ({ domain }) =>
            dispatch(createInvalidateRequestAction({ domain })),
          // for passing down to component
          request: customRequirements =>
            // this is an arbitrary requirements, not same that resolved
            // in mapStateToRequirements func
            dispatch(createRequestAction(customRequirements)),
        }),
      }),
    )(WrappedComponent);
};

export default ({
  provisionSelector,
  stateSelector,
  requirementsComparator,
}) => ({
  provide: createReactReduxProvider({
    provisionSelector,
    requirementsComparator,
  }),
  createMiddleware,
  strategyEnhancer,
  reducer: createRequestReducer(/* reducerOptions */),
  selectors: {
    selectError: compose(
      selectError,
      stateSelector,
    ),
    selectIsError: compose(
      selectIsError,
      stateSelector,
    ),
    selectIsPending: compose(
      selectIsPending,
      stateSelector,
    ),
    selectIsReady: compose(
      selectIsReady,
      stateSelector,
    ),
    selectIsUnsent: compose(
      selectIsUnsent,
      stateSelector,
    ),
    selectIsValid: compose(
      selectIsValid,
      stateSelector,
    ),
    selectLastError: compose(
      selectLastError,
      stateSelector,
    ),
    selectPlaceholder: compose(
      selectPlaceholder,
      stateSelector,
    ),
    selectReadyState: compose(
      selectReadyState,
      stateSelector,
    ),
    selectResult: compose(
      selectResult,
      stateSelector,
    ),
  },
});
