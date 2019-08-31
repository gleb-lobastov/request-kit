import {
  createPendingAction,
  createFailureAction,
  createSuccessAction,
} from './actionCreators';
// eslint-disable-next-line no-unused-vars
import { TRequestStrategy, TDispatch, TGetState } from './interface';

export default <TRequirements extends {}, TResponse>(
  requestStrategy: TRequestStrategy<TRequirements, TResponse>,
) => (
  requirements: TRequirements,
  dispatch: TDispatch,
  getState: TGetState,
) => {
  dispatch(createPendingAction(requirements));
  return requestStrategy(requirements, dispatch, getState).then(
    result => {
      const action =
        result instanceof Error
          ? createFailureAction(requirements, result)
          : createSuccessAction(requirements, result);
      dispatch(action);
      return result;
    },
    error => {
      dispatch(createFailureAction(requirements, error));
      return error;
    },
  );
};
