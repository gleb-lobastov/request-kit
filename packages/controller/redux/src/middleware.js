import { INITIATE_REQUEST } from './actionTypes';
import {
  createPendingAction,
  createFailureAction,
  createSuccessAction,
} from './actionCreators';

export default ({
  engine,
  initiateRequestActionType = INITIATE_REQUEST,
}) => store => next => action => {
  const { type: actionType, payload: requirements = {} } = action;

  if (actionType !== initiateRequestActionType) {
    return next(action);
  }

  store.dispatch(createPendingAction(requirements));
  return engine
    .request(requirements)
    .then(
      result => store.dispatch(createSuccessAction(requirements, result)),
      error => store.dispatch(createFailureAction(requirements, error)),
    );
};
