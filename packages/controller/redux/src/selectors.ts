import * as consts from './consts';
import {
  State,
  ReadyState,
  Result,
  SuccessResultState,
  FailureResultState,
} from './types';

type Optional<T> = T | undefined;

const checkHasProperty = (object: object, property: string): boolean =>
  Object.prototype.hasOwnProperty.call(object, property);

export const selectReadyState = (state: State): ReadyState =>
  state.readyState || consts.READY_STATE.UNSENT;

export const selectIsReady = (state: State): boolean =>
  state.readyState === consts.READY_STATE.DONE;

export const selectIsPending = (state: State): boolean =>
  !selectIsReady(state) && state.readyState !== consts.READY_STATE.UNSENT;

export const selectRelevantResult = (state: State): Optional<Result> => {
  if (!state || !state.recent || !checkHasProperty(state.recent, 'result')) {
    return undefined;
  }
  return (<SuccessResultState>state.recent).result;
};

export const selectAvailableResult = (state: State): Optional<Result> => {
  if (!state) {
    return undefined;
  }
  if (state.recent && checkHasProperty(state.recent, 'result')) {
    return (<SuccessResultState>state.recent).result;
  }
  if (
    state.lastSuccessful &&
    checkHasProperty(state.lastSuccessful, 'result')
  ) {
    return state.lastSuccessful.result;
  }
  return undefined;
};

export const selectError = (state: State): Optional<Error> => {
  if (!state || !state.recent || !checkHasProperty(state.recent, 'error')) {
    return undefined;
  }
  return (<FailureResultState>state.recent).error;
};
