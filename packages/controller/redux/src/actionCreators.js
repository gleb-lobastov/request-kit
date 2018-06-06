import { INITIATE_REQUEST, PROCESS_REQUEST } from './actionTypes';
import * as consts from './consts';

export const createRequestAction = params => (
  {
    type: INITIATE_REQUEST,
    payload: params,
  }
);

export const createPendingAction = params => (
  {
    type: PROCESS_REQUEST,
    meta: { params, readyState: consts.READY_STATE.OPENED },
  }
);

export const createFailureAction = (params, error) => (
  {
    type: PROCESS_REQUEST,
    payload: error,
    error: true,
    meta: { params, readyState: consts.READY_STATE.DONE },
  }
);

export const createSuccessAction = (params, result) => (
  {
    type: PROCESS_REQUEST,
    payload: result,
    meta: { params, readyState: consts.READY_STATE.DONE },
  }
);
