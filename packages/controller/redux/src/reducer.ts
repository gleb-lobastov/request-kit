import { PROCESS_REQUEST } from './actionTypes';
import * as consts from './consts';
import { State, Action, RequestAction } from './types';

const checkIsRequestAction = (
  action: Action | RequestAction,
): action is RequestAction => {
  const { type: actionType } = action;
  return (
    (<RequestAction>action).meta !== undefined && actionType === PROCESS_REQUEST
  );
};

export default (/* further configuration */) => (
  state: State = {},
  action: Action,
) => {
  if (!checkIsRequestAction(action)) {
    return state;
  }

  const { payload, error, meta: { readyState = undefined } = {} } = action;

  if (readyState === consts.READY_STATE.OPENED) {
    return {
      ...state,
      readyState,
      recent: {},
    };
  }
  if (readyState === consts.READY_STATE.DONE) {
    if (error) {
      return {
        ...state,
        readyState,
        recent: { error: payload },
      };
    }
    return {
      ...state,
      readyState,
      recent: { result: payload },
      lastSuccessful: { result: payload },
    };
  }
  return state;
};
