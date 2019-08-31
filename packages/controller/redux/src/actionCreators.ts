import {
  INITIATE_REQUEST,
  PROCESS_REQUEST,
  INVALIDATE_REQUEST,
} from './actionTypes';
import { READY_STATE } from './consts';
/* eslint-disable no-unused-vars */
import {
  TInitiateRequestAction,
  TRequestFailureAction,
  TRequestSuccessAction,
  TInvalidateRequestAction,
} from './interface';
/* eslint-enable no-unused-vars */

export const createRequestAction = <TRequirements extends {}>(
  requirements: TRequirements,
): TInitiateRequestAction<TRequirements> => ({
  type: INITIATE_REQUEST,
  payload: requirements,
});

export const createPendingAction = <TRequirements extends {}>(
  requirements: TRequirements,
) => ({
  type: PROCESS_REQUEST,
  meta: {
    ...requirements,
    readyState: READY_STATE.OPENED,
  },
});

export const createFailureAction = <TRequirements extends {}>(
  requirements: TRequirements,
  error: Error,
): TRequestFailureAction<TRequirements> => ({
  type: PROCESS_REQUEST,
  payload: error,
  error: true,
  meta: {
    ...requirements,
    readyState: READY_STATE.DONE,
  },
});

export const createSuccessAction = <TRequirements extends {}, TResponse>(
  requirements: TRequirements,
  result: TResponse,
): TRequestSuccessAction<TRequirements, TResponse> => ({
  type: PROCESS_REQUEST,
  payload: result,
  meta: {
    ...requirements,
    readyState: READY_STATE.DONE,
  },
});

export const createInvalidateRequestAction = <
  TInvalidateRequirements extends {}
>(
  invalidateRequirements: TInvalidateRequirements,
): TInvalidateRequestAction<TInvalidateRequirements> => ({
  type: INVALIDATE_REQUEST,
  meta: { ...invalidateRequirements },
});
