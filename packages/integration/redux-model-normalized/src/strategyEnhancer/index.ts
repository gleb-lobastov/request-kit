import { Strategy, Action, State } from '@request-kit/controller-redux';
import { createEntitiesAction, createEntitiesErrorAction } from '../state';
import { INormalizedResponse } from './interface';

export default (strategy: Strategy) => <EntitiesState>(
  requirements: any,
  dispatch: (action: Action) => any,
  getState: () => State,
) =>
  strategy(requirements, dispatch, getState).then(
    ({ result, entities }: INormalizedResponse<EntitiesState>) => {
      if (entities) {
        dispatch(createEntitiesAction(entities, { key: 'key', requirements }));
      }
      return result;
    },
    (error: Error) => {
      // for optimistic update
      dispatch(createEntitiesErrorAction(error, { requirements }));
      return error;
    },
  );
