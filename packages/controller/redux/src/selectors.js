import * as consts from './consts';

export const selectReadyState = state => state.readyState;
export const selectIsReady = state => state.readyState === consts.READY_STATE.DONE;
export const selectIsPending = state => (
  !selectIsReady(state) &&
  state.readyState !== consts.READY_STATE.UNSENT
);

const checkHasProperty = (object, property) => (
  Object.prototype.hasOwnProperty.call(object, property)
);

export const selectRelevantResult = (state) => {
  if (!state || !state.recent || !checkHasProperty(state.recent, 'result')) {
    return undefined;
  }
  return state.recent.result;
};

export const selectAvailableResult = (state) => {
  if (!state) {
    return undefined;
  }
  if (state.recent && checkHasProperty(state.recent, 'result')) {
    return state.recent.result;
  }
  if (state.lastSuccessful && checkHasProperty(state.lastSuccessful, 'result')) {
    return state.lastSuccessful.result;
  }
  return undefined;
};

export const selectError = (state) => {
  if (!state || !state.recent || !checkHasProperty(state.recent, 'error')) {
    return undefined;
  }
  return state.recent.error;
};
