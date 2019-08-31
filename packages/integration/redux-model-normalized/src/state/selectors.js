export const selectDict = (state, modelName) =>
  (state && state[modelName]) || {};

export const selectItem = (state, modelName, id) => {
  const entitiesDict = selectDict(state, modelName);
  if (!entitiesDict) {
    return undefined;
  }
  return entitiesDict[id];
};

export const selectList = (
  state,
  modelName,
  ids,
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

export const selectMissingIds = (state, modelName, requiredIds) => {
  const entitiesDict = selectDict(state, modelName);
  if (!entitiesDict || !requiredIds) {
    return [];
  }
  return requiredIds.filter(requiredId => !entitiesDict[requiredId]);
};
