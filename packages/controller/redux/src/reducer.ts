import { PROCESS_REQUEST } from './actionTypes';
import * as consts from './consts';

export default (/* further configuration */) => (state = {}, action) => {
  const {
    type: actionType,
    payload,
    error,
    meta: { readyState },
  } = action;

  if (actionType !== PROCESS_REQUEST) {
    return state;
  }
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
