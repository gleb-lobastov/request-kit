import {
  /* eslint-disable no-unused-vars */
  TAction,
  TInitiateRequestAction,
  TInvalidateRequestAction,
  TRequestAction,
  TRequestSuccessAction,
  TRequestFailureAction,
  /* eslint-enable no-unused-vars */
} from './interface';

const namespace = '@@REQUEST_KIT';
export const INITIATE_REQUEST = `${namespace}__INITIATE_REQUEST`;
export const PROCESS_REQUEST = `${namespace}__PROCEED_REQUEST`;
export const INVALIDATE_REQUEST = `${namespace}__INVALIDATE_REQUEST`;

export function checkIsInitiateRequestAction<TRequirements>(
  action: TAction,
): action is TInitiateRequestAction<TRequirements> {
  const { type: actionType } = action;
  return (
    (action as TInitiateRequestAction<TRequirements>).payload !== undefined &&
    actionType === INITIATE_REQUEST
  );
}

export function checkIsRequestAction<TPayload, TRequirements>(
  action: TAction,
): action is TRequestAction<TPayload, TRequirements> {
  const { type: actionType } = action;
  return (
    (action as TRequestAction<TPayload, TRequirements>).meta !== undefined &&
    actionType === PROCESS_REQUEST
  );
}

export function checkIsInvalidateRequestAction<TInvalidateRequirements>(
  action: TAction,
): action is TInvalidateRequestAction<TInvalidateRequirements> {
  const { type: actionType } = action;
  return (
    (action as TInvalidateRequestAction<TInvalidateRequirements>).meta !==
      undefined && actionType === INVALIDATE_REQUEST
  );
}

export function checkIsRequestSuccessAction<
  TRequirements extends {},
  TResponse
>(action: TAction): action is TRequestSuccessAction<TRequirements, TResponse> {
  if (!checkIsRequestAction<TRequirements, TResponse>(action)) {
    return false;
  }
  const { error, payload } = action;
  return !error && !(payload instanceof Error);
}

export function checkIsRequestFailureAction<TRequirements>(
  action: TAction,
): action is TRequestFailureAction<TRequirements> {
  if (!checkIsRequestAction<any, TRequirements>(action)) {
    return false;
  }
  const { error, payload } = action;
  return Boolean(error) && payload instanceof Error;
}
