import { INITIATE_REQUEST } from './actionTypes';
import { createPendingAction, createFailureAction, createSuccessAction } from './actionCreators';

export default ({ engine }) => store => next => (action) => {
  const {
    type: actionType,
    payload: params,
  } = action;

  if (actionType !== INITIATE_REQUEST) {
    return next(action);
  }

  store.dispatch(createPendingAction(params));
  return engine.request(params).then(
    result => store.dispatch(createSuccessAction(params, result)),
    error => store.dispatch(createFailureAction(params, error)),
  );
};
