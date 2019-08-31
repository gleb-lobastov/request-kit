import { createEntitiesAction, createEntitiesErrorAction } from '../state';

export default next => (requirements, dispatch, getState) =>
  next(requirements, dispatch, getState).then(
    ({ result, entities }) => {
      if (entities) {
        dispatch(createEntitiesAction(entities, { key: 'key', requirements }));
      }
      return result;
    },
    error => {
      // for optimistic update
      dispatch(createEntitiesErrorAction(error, { requirements }));
      return error;
    },
  );
