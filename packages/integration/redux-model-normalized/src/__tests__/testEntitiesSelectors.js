import {
  selectDict,
  selectItem,
  selectList,
  selectMissingIds,
} from '../state/selectors';

describe('selectors', () => {
  it('should select item from state', () => {
    const modelName = 'someModelName';
    const modelWithId1 = { nestingModelId: 1, clientField: 'fieldValue' };
    const state = {
      [modelName]: {
        1: modelWithId1,
      },
    };
    expect(selectItem(state, modelName, 1)).toBe(modelWithId1);
  });

  it('should select list of specified items from state', () => {
    const modelName = 'someModelName';
    const modelWithId1 = { nestingModelId: 1, clientField: 'fieldValue1' };
    const modelWithId3 = { nestingModelId: 3, clientField: 'fieldValue3' };
    const modelWithId9 = { nestingModelId: 9, clientField: 'fieldValue9' };
    const state = {
      [modelName]: {
        1: modelWithId1,
        3: modelWithId3,
        9: modelWithId9,
      },
    };
    expect(selectList(state, modelName, [1, 9])).toEqual([
      modelWithId1,
      modelWithId9,
    ]);
  });

  it('should select dict of items from state', () => {
    const modelName = 'someModelName';
    const modelWithId1 = { nestingModelId: 1, clientField: 'fieldValue1' };
    const modelWithId3 = { nestingModelId: 3, clientField: 'fieldValue3' };
    const modelWithId9 = { nestingModelId: 9, clientField: 'fieldValue9' };
    const state = {
      [modelName]: {
        1: modelWithId1,
        3: modelWithId3,
        9: modelWithId9,
      },
    };
    expect(selectDict(state, modelName)).toEqual(state[modelName]);
  });

  it('should select missing ids for given required ids', () => {
    const modelName = 'someModelName';
    const state = {
      [modelName]: {
        1: {},
        3: {},
        9: {},
      },
    };
    expect(selectMissingIds(state, modelName, [3, 5, 7, 9])).toEqual([5, 7]);
  });
});
