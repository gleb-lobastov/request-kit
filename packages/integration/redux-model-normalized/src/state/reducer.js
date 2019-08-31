import { UPDATE_ENTITIES_SUCCESS } from './actionTypes';

const checkIsEntitiesAction = action => {
  const { type: actionType, payload } = action;
  return actionType === UPDATE_ENTITIES_SUCCESS && payload !== undefined;
};

export default (entitiesState = {}, action) => {
  if (!checkIsEntitiesAction(action)) {
    return entitiesState;
  }

  const { payload: entitiesUpdates } = action;

  const updates = Object.entries(entitiesUpdates).reduce(
    (stateInterim, [modelName, modelUpdates]) => {
      stateInterim[modelName] = {
        ...entitiesState[modelName],
        ...modelUpdates,
      };
      return stateInterim;
    },
    {},
  );
  return { ...entitiesState, ...updates };
};
