import { INITIATE_REQUEST } from './actionTypes';
import {
  createPendingAction,
  createFailureAction,
  createSuccessAction,
} from './actionCreators';
import { Action, InitiateRequestAction } from './types';

type Engine = {
  request: (requirements: object) => Promise<any>;
};

export interface Store {
  dispatch: (action: Action) => any;
}

interface ControllerOptions {
  engine: Engine;
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

export default ({ engine }: ControllerOptions) => (store: Store) => (
  next: Function,
) => (action: Action) => {
  if (!checkIsInitiateRequestAction(action)) {
    return next(action);
  }

  const { payload: requirements = {} } = action;

  store.dispatch(createPendingAction(requirements));
  return engine
    .request(requirements)
    .then(
      result => store.dispatch(createSuccessAction(requirements, result)),
      error => store.dispatch(createFailureAction(requirements, error)),
    );
};
