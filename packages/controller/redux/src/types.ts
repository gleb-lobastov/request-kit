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
  meta: { readyState: ReadyState; requirements: any };
  payload?: Payload;
  error?: boolean;
}

export interface RequestSuccessAction extends RequestAction {
  payload: Payload;
  error?: false;
}

export interface RequestFailureAction extends RequestAction {
  payload: Error;
  error: true;
}

export interface State {
  lastSuccessful?: SuccessResultState;
  readyState?: ReadyState;
  recent?: ResultState;
  requirements?: any;
}

export interface ReducerConfig {
  transformResult?: (payload: any) => any;
}
