import { IModelsState, Id } from './interface';

export const selectDict = <EntitiesState>(
  state: IModelsState<EntitiesState>,
  modelName: string,
) => {
  return state && state[modelName];
};

export const selectItem = <EntitiesState>(
  state: IModelsState<EntitiesState>,
  modelName: string,
  id: Id,
) => {
  const entitiesDict = selectDict(state, modelName);
  if (!entitiesDict) {
    return undefined;
  }
  return entitiesDict[id];
};

export const selectList = <EntitiesState>(
  state: IModelsState<EntitiesState>,
  modelName: string,
  ids: Id[],
  { shouldSkipMissing = false } = {},
) => {
  const entitiesDict = selectDict(state, modelName);
  if (!entitiesDict || !ids) {
    return [];
  }
  const interimResult = ids.map(id => entitiesDict[id]);
  if (shouldSkipMissing) {
    return interimResult.filter(Boolean);
  }
  return interimResult;
};

export const selectMissingIds = <EntitiesState>(
  state: IModelsState<EntitiesState>,
  modelName: string,
  requiredIds: Id[],
) => {
  const entitiesDict = selectDict(state, modelName);
  if (!entitiesDict || !requiredIds) {
    return [];
  }
  return requiredIds.filter(requiredId => !entitiesDict[requiredId]);
};
