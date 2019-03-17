import {
  UPDATE_ENTITIES_SUCCESS,
  UPDATE_ENTITIES_FAILURE,
} from './actionTypes';
import {
  IEntitiesActionCreatorSuccess,
  IEntitiesActionCreatorFailure,
} from './interface';

export const createEntitiesAction: IEntitiesActionCreatorSuccess = <
  EntitiesState
>(
  entities: EntitiesState,
  meta: object,
) => ({
  type: UPDATE_ENTITIES_SUCCESS,
  payload: entities,
  meta,
});

export const createEntitiesErrorAction: IEntitiesActionCreatorFailure = (
  error,
  meta,
) => ({
  type: UPDATE_ENTITIES_FAILURE,
  error: true,
  payload: error,
  meta,
});
