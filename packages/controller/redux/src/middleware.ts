import { INITIATE_REQUEST } from './actionTypes';
import {
  createPendingAction,
  createFailureAction,
  createSuccessAction,
} from './actionCreators';
import { Action, InitiateRequestAction } from './types';

export interface State {}

export interface Store {
  dispatch: (action: Action) => any;
  getState: () => State;
}

export interface Requirements {}
export interface Result {}

export interface Strategy {
  (
    requirements: Requirements,
    dispatch: (action: Action) => any,
    getState: () => State,
  ): Promise<any>;
}
export interface ControllerOptions {
  requestHandler: (
    requirements: Requirements,
    dispatch?: (action: Action) => any,
    getState?: () => State,
  ) => Promise<Result>;
  strategyEnhancer?: (defaultStrategy: Strategy) => Strategy;
}

function checkIsInitiateRequestAction(
  action: Action | InitiateRequestAction,
): action is InitiateRequestAction {
  const { type: actionType } = action;
  return (
    (<InitiateRequestAction>action).payload !== undefined &&
    actionType === INITIATE_REQUEST
  );
}

const strategyCreator = (requestHandler: (...args: any[]) => Promise<any>) => (
  requirements: object,
  dispatch: (action: Action) => any,
  getState: () => object,
) => {
  dispatch(createPendingAction(requirements));
  const response = requestHandler(requirements, dispatch, getState);
  response.then(
    result => dispatch(createSuccessAction(requirements, result)),
    error => dispatch(createFailureAction(requirements, error)),
  );
  return response;
};

const identity = (value: any) => value;

export default ({
  requestHandler,
  strategyEnhancer = identity,
}: ControllerOptions) => {
  const strategy = strategyEnhancer(strategyCreator(requestHandler));
  return (store: Store) => (next: Function) => (action: Action) => {
    console.log({ action });
    if (!checkIsInitiateRequestAction(action)) {
      return next(action);
    }
    const { payload: requirements = {} } = action;
    return strategy(requirements, store.dispatch, store.getState);
  };
};
