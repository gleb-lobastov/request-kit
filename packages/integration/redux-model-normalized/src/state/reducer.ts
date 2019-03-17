import { Action as IAction } from 'redux';
import { UPDATE_ENTITIES_SUCCESS } from './actionTypes';
import { IEntitiesAction, IEntitiesReducer } from './interface';

const checkIsEntitiesAction = <EntitiesState>(
  action: IAction | IEntitiesAction<EntitiesState>,
): action is IEntitiesAction<EntitiesState> => {
  const { type: actionType } = action;
  return (
    actionType === UPDATE_ENTITIES_SUCCESS &&
    (<IEntitiesAction<EntitiesState>>action).payload !== undefined
  );
};

export interface IPartialEntities {
  [modelName: string]: {};
}
export default <EntitiesState extends IPartialEntities>(
  // @ts-ignore
  entitiesState: EntitiesState = {},
  action: IAction,
) => {
  if (!checkIsEntitiesAction(action)) {
    return entitiesState;
  }

  const { payload: entitiesUpdates } = action;

  const updates = Object.entries(entitiesUpdates).reduce<
    Partial<EntitiesState>
  >((stateInterim, [modelName, modelUpdates]) => {
    stateInterim[modelName] = {
      ...entitiesState[modelName],
      ...modelUpdates,
    };
    return stateInterim;
  }, {});
  return { ...entitiesState, ...updates };
};
