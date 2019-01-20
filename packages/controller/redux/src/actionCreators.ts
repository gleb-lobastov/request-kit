import { INITIATE_REQUEST, PROCESS_REQUEST } from './actionTypes';
import * as consts from './consts';

export const createRequestAction = requirements => ({
  type: INITIATE_REQUEST,
  payload: requirements,
});

export const createPendingAction = ({ meta, ...requirements } = {}) => ({
  type: PROCESS_REQUEST,
  meta: {
    ...meta,
    requirements,
    readyState: consts.READY_STATE.OPENED,
  },
});

export const createFailureAction = ({ meta, ...requirements } = {}, error) => ({
  type: PROCESS_REQUEST,
  payload: error,
  error: true,
  meta: {
    ...meta,
    requirements,
    readyState: consts.READY_STATE.DONE,
  },
});

export const createSuccessAction = (
  { meta, ...requirements } = {},
  result,
) => ({
  type: PROCESS_REQUEST,
  payload: result,
  meta: {
    ...meta,
    requirements,
    readyState: consts.READY_STATE.DONE,
  },
});
