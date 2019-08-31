import { checkIsInitiateRequestAction } from './actionTypes';
import {
  /* eslint-disable no-unused-vars */
  TStore,
  TAction,
  TActionHandler,
  TInitiateRequestAction,
  TMiddlewareOptions,
  /* eslint-enable no-unused-vars */
} from './interface';

export default <TRequirements, TResponse>({
  requestStrategy,
}: TMiddlewareOptions<TRequirements, TResponse>) => (store: TStore) => (
  next: TActionHandler,
) => (action: TAction) => {
  if (!checkIsInitiateRequestAction(action)) {
    return next(action);
  }
  const { payload: requirements } = action as TInitiateRequestAction<
    TRequirements
  >;
  return requestStrategy(requirements, store.dispatch, store.getState);
};
