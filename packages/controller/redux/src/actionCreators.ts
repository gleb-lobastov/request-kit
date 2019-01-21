import { INITIATE_REQUEST, PROCESS_REQUEST } from './actionTypes';
import * as consts from './consts';
import {
  Action,
  RequestFailureAction,
  RequestSuccessAction,
  RequestAction,
} from './types';

type ActionCreatorOptions = {
  meta?: {};
};
type ActionCreator = (options: ActionCreatorOptions) => Action;

type RequestActionCreator = (options: ActionCreatorOptions) => RequestAction;

type FailureActionCreator = (
  options: ActionCreatorOptions,
  result: Error,
) => RequestFailureAction;

type SuccessActionCreator = (
  options: ActionCreatorOptions,
  result: any,
) => RequestSuccessAction;

export const createRequestAction: ActionCreator = requirements => ({
  type: INITIATE_REQUEST,
  payload: requirements,
});

export const createPendingAction: RequestActionCreator = ({
  meta,
  ...requirements
} = {}) => ({
  type: PROCESS_REQUEST,
  meta: {
    ...meta,
    requirements,
    readyState: consts.READY_STATE.OPENED,
  },
});

export const createFailureAction: FailureActionCreator = (
  { meta, ...requirements } = {},
  error,
) => ({
  type: PROCESS_REQUEST,
  payload: error,
  error: true,
  meta: {
    ...meta,
    requirements,
    readyState: consts.READY_STATE.DONE,
  },
});

export const createSuccessAction: SuccessActionCreator = (
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
