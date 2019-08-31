import {
  checkIsInvalidateRequestAction,
  checkIsRequestAction,
  checkIsRequestSuccessAction,
  checkIsRequestFailureAction,
} from './actionTypes';
import { EMPTY_STATE, READY_STATE } from './consts';
// eslint-disable-next-line no-unused-vars
import { TAction, TRequestState } from './interface';

export default (/* further configuration */) => <TResponse>(
  state: TRequestState<TResponse> = EMPTY_STATE,
  action: TAction,
): TRequestState<TResponse> => {
  if (checkIsInvalidateRequestAction(action)) {
    return {
      ...state,
      isValid: false,
    };
  }

  if (!checkIsRequestAction(action)) {
    return state;
  }

  const { meta: { readyState = undefined } = {} } = action;

  if (readyState === READY_STATE.OPENED) {
    return {
      ...state,
      readyState,
    };
  }
  if (readyState === READY_STATE.DONE) {
    if (checkIsRequestFailureAction(action)) {
      const { payload } = action;
      return {
        ...state,
        readyState,
        lastError: payload,
        isError: true,
        // isValid: true?
      };
    }
    if (checkIsRequestSuccessAction<{}, TResponse>(action)) {
      const { payload } = action;
      return {
        ...state,
        readyState,
        lastResult: payload,
        isError: false,
        isValid: true,
      };
    }
  }
  return state;
};
