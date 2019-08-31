import { READY_STATE, EMPTY_STATE } from './consts';
import { TRequestState } from './interface'; // eslint-disable-line no-unused-vars

export const selectReadyState = <TResponse>({
  readyState,
}: TRequestState<TResponse> = EMPTY_STATE) => readyState || READY_STATE.UNSENT;

export const selectIsUnsent = <TResponse>(
  state: TRequestState<TResponse> = EMPTY_STATE,
) => selectReadyState(state) === READY_STATE.UNSENT;

export const selectIsReady = <TResponse>(
  state: TRequestState<TResponse> = EMPTY_STATE,
) => selectReadyState(state) === READY_STATE.DONE;

export const selectIsPending = <TResponse>(
  state: TRequestState<TResponse> = EMPTY_STATE,
) => !selectIsReady(state) && !selectIsUnsent(state);

export const selectIsValid = <TResponse>({
  isValid,
}: TRequestState<TResponse> = EMPTY_STATE) => isValid;
export const selectIsError = <TResponse>({
  isError,
}: TRequestState<TResponse> = EMPTY_STATE) => isError;

export const selectResult = <TResponse>({
  isValid,
  isError,
  lastResult,
}: TRequestState<TResponse> = EMPTY_STATE) =>
  isValid && !isError ? lastResult : undefined;

export const selectPlaceholder = <TResponse>({
  lastResult,
}: TRequestState<TResponse> = EMPTY_STATE) => lastResult;

export const selectError = <TResponse>({
  isError,
  lastError,
}: TRequestState<TResponse> = EMPTY_STATE) => (isError ? lastError : undefined);

export const selectLastError = <TResponse>({
  lastError,
}: TRequestState<TResponse> = EMPTY_STATE) => lastError;
