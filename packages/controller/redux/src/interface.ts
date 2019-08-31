// eslint-disable-next-line no-unused-vars
import { READY_STATE } from './consts';

interface TRequestMeta {
  readyState: READY_STATE;
}

export interface TAction {
  type: string | symbol;
}

export interface TRequestStrategy<TRequirements extends {}, TResponse> {
  (requirements: TRequirements, ...args: any[]): Promise<TResponse>;
}

export interface TMiddlewareOptions<TRequirements extends {}, TResponse> {
  requestStrategy: TRequestStrategy<TRequirements, TResponse>;
}

export interface TDispatch {
  (action: TAction): any;
}

export interface TGetState {
  (): any;
}

export interface TStore {
  dispatch: TDispatch;
  getState: TGetState;
}

export interface TActionHandler {
  (action: TAction): any;
}

export interface TInitiateRequestAction<TRequirements extends {}>
  extends TAction {
  payload: TRequirements;
}

export interface TInvalidateRequestAction<TInvalidateRequirements>
  extends TAction {
  meta: TInvalidateRequirements;
}

export interface TRequestAction<TRequirements extends {}, TResponse>
  extends TAction {
  meta: TRequestMeta & TRequirements;
  payload?: TResponse;
  error?: boolean;
}

export interface TRequestPendingAction<TRequirements extends {}>
  extends TRequestAction<TRequirements, never> {
  meta: TRequestMeta & TRequirements;
  payload?: never;
  error?: never;
}

export interface TRequestSuccessAction<TRequirements extends {}, TResponse>
  extends TRequestAction<TRequirements, TResponse> {
  payload: TResponse;
  error?: false;
}

export interface TRequestFailureAction<TRequirements extends {}>
  extends TRequestAction<TRequirements, Error> {
  payload: Error;
  error: true;
}

export interface TRequestState<TResponse> {
  readyState: READY_STATE;
  lastError?: Error;
  lastResult?: TResponse;
  isError: boolean;
  isValid: boolean;
}
