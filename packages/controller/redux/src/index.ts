import * as requestSelectors from './selectors';
import { State, Strategy } from './middleware';
import { Action } from './types';

export { default as createRequestMiddleware } from './middleware';
export { createRequestAction } from './actionCreators';
export { default as createRequestReducer } from './reducer';
export { requestSelectors };
export { PROCESS_REQUEST as processRequestActionType } from './actionTypes';

// workaround for https://github.com/babel/babel/issues/8361
export interface State extends State {}
export interface Strategy extends Strategy {}
export interface Action extends Action {}
