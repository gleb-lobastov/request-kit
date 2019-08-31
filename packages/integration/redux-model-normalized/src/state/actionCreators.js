import {
  UPDATE_ENTITIES_SUCCESS,
  UPDATE_ENTITIES_FAILURE,
} from './actionTypes';

export const createEntitiesAction = (entities, meta) => ({
  type: UPDATE_ENTITIES_SUCCESS,
  payload: entities,
  meta,
});

export const createEntitiesErrorAction = (error, meta) => ({
  type: UPDATE_ENTITIES_FAILURE,
  error: true,
  payload: error,
  meta,
});
