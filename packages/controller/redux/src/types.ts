export type ActionType = string | symbol;
export type ReadyState = number;
export type Payload = Error | any;
export type Result = any;
export type FailureResultState = { error: Error };
export type SuccessResultState = { result: Result };
export type ResultState = SuccessResultState | FailureResultState;

export interface Action {
  type: ActionType;
}

export interface InitiateRequestAction extends Action {
  payload: any;
}

export interface RequestAction extends Action {
  meta: { readyState: ReadyState };
  payload?: Payload;
  error?: boolean;
}

export interface RequestSuccessAction extends RequestAction {
  meta: { readyState: ReadyState };
  payload: Payload;
  error?: false;
}

export interface RequestFailureAction extends RequestAction {
  meta: { readyState: ReadyState };
  payload: Error;
  error: true;
}

export interface State {
  readyState?: ReadyState;
  recent?: ResultState;
  lastSuccessful?: SuccessResultState;
}
